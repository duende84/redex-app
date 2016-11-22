Alloy.Globals.LO.show(L('loader_default'), false);
require('http').request({
    timeout: 10000,
    type: 'POST',
    format: 'JSON',
    url: Alloy.Globals.Secrets.backend.url + '/api/v1/users/orders',
    oauth_type: 'userToken',
    success: function(response) {
        var dataItems = [];
        Alloy.Globals.LO.hide();

        if (_.isEmpty(response.delivery_orders)) {
            require('dialogs').openDialog({
                title: L('app_name'),
                message: L('delivery_orders_empty')
            });
        } else {
            _.each(response.delivery_orders, function(order) {
                var dataItem = {
                    raw_data: order,
                    order_internal_guide : { text: 'Guia Interna: ' + order.internal_guide },
                    order_destinatary    : { text: order.destinatary },
                    order_adderss        : { text: order.adderss },
                    order_state          : { backgroundColor: order.state === 'pendiente' ? Alloy.Globals.colors.soft_red : Alloy.Globals.colors.soft_green },
                    properties: {
                        touchEnabled     : false,
                        accessoryType    : Ti.UI.LIST_ACCESSORY_TYPE_NONE,
                        height           : '95dip'
                    }
                };

                dataItems.push(dataItem);
            });

            $.listSection.setItems(dataItems);
            $.listView.show();
        }
    }
});

$.listView.addEventListener('itemclick', function(evt) {
    var item = evt.section.getItemAt(evt.itemIndex);
    var bindId = evt.bindId;
    console.error('bindId: ', bindId);
    console.error('Tab in: ', item.raw_data);

    if (bindId === 'right' || bindId === 'camera_icon' || bindId === 'order_state') {
        require('photo_uploader').takePhoto({
            beforeUpload: function(){
                Alloy.Globals.LO.show(L('uploading'), false);
            },
            success: function(cloudinaryResponse){
                Alloy.Globals.LO.hide();
                Ti.API.debug('success cloudinaryResponse: ', JSON.stringify(cloudinaryResponse));

                require('http').request({
                    timeout: 10000,
                    type: 'POST',
                    format: 'JSON',
                    oauth_type: 'appToken',
                    data: {
                        image_url: cloudinaryResponse.url,
                        delivery_order_id: item.raw_data.id
                    },
                    url: Alloy.Globals.Secrets.backend.url + '/api/v1/delivery_orders/image',
                    success: function(response) {
                        require('dialogs').openDialog({
                            message: L('photo_uploader_success'),
                            title: L('success')
                        });
                    },
                    failure: function(response) {
                        require('dialogs').openDialog({
                            message: L('photo_uploader_error_upload'),
                            title: L('error')
                        });
                    }
                });
            },
            error: function(response){
                Alloy.Globals.LO.hide();
                Ti.API.debug('error response: ', response);
                require('dialogs').openDialog({
                    message: L('photo_uploader_error_upload'),
                    title: L('error')
                });
            }
        })();
    }
});
