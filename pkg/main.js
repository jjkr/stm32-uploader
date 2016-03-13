'use strict';

var _usb = require('usb');

var usb = _interopRequireWildcard(_usb);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _usbDfu = require('./usb-dfu');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

//usb.setDebugLevel(0);
usb.setDebugLevel(4); // debug

const STMICRO_VENDOR_ID = 0x0483;
const devices = usb.getDeviceList();
const stm32Device = devices.find(d => {
    return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID;
});

//console.log('found stm32 device:');
//console.log(stm32Device.deviceDescriptor);
//console.log('vendorid: ' + stm32Device.deviceDescriptor.idVendor.toString(16));
//console.log('productid: ' +
//            stm32Device.deviceDescriptor.idProduct.toString(16));

const usbDev = new _usbDfu.UsbDevice(stm32Device);
const index = stm32Device.interface(0).descriptor.iInterface;

console.log('calling getDescriptor(' + index + ')');
usbDev.getDescriptor(index).then(data => {
    console.log('chip data: ' + data);
}).catch(err => {
    console.log('getDescriptor err: ' + err);
});

console.log('end of main');

//console.log('opening');
//stm32Device.open();
//
//console.log('claiming interface...');
//const iface = stm32Device.interface(0);
//iface.claim();

// getString
//const DEVICE_TO_HOST = 1 << 7;  // Bit 7 (MSB)
//const STANDARD = 0;             // Bits 6..5
//const RECIPIENT_DEVICE = 0;     // Bits 4..0
//const requestType = DEVICE_TO_HOST | STANDARD | RECIPIENT_DEVICE;
//const iIndex = iface.descriptor.iInterface;
//console.log('requestType: ' + requestType.toString(16));
//stm32Device.controlTransfer(requestType,     // bmRequestType
//                            6,               // bRequest
//                            0x300 | iIndex,  // wValue
//                            0,               // wIndex
//                            255,             // length
//                            (err, data) => {
//                              if (err) {
//                                console.log(
//                                  'usb Device.controlTransfer error: ' + err);
//                              } else {
//                                console.log(
//                                  'usb Device.controlTransfer data: ');
//                                console.log(data.toString());
//                              }
//                            });

// description.then(d => {
//  console.log('description');
//  console.log(d);
//});

//stm32Device.getStringDescriptor(0, (err, data) => {
//  if (err) {
//    console.log('getStringDescriptor err: ' + err);
//  } else {
//    console.log('data: ');
//    console.log(data);
//  }
//});

//stm32Device.reset(err => {
//  if (err) {
//    console.log('reset err: ' + err);
//  }
//});

//console.log('product: ' + stm32Device.deviceDescriptor.idProduct.toString(16));
//console.log(usb);

//for (const d of devices.filter(
//         d => { return d.deviceDescriptor.idVendor === 0x10c4; })) {
//  //console.log(d.deviceDescriptor.bDeviceClass.toString(16));
//
//  console.log('vendor: ' + d.deviceDescriptor.idVendor.toString(16) +
//              ' product: ' + d.deviceDescriptor.idProduct.toString(16));
//}