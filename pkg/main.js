'use strict';

var _usb = require('usb');

var usb = _interopRequireWildcard(_usb);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

usb.setDebugLevel(4);

const devices = usb.getDeviceList();

const STMICRO_VENDOR_ID = 0x0483;
const stm32Device = devices.find(d => {
  return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID;
});

console.log('found stm32 device:');
console.log(stm32Device);

console.log('opening');
stm32Device.open();

console.log('claiming interface...');
stm32Device.interface(0).claim();

//stm32Device.getStringDescriptor(0, (err, data) => {
//  if (err) {
//    console.log('getStringDescriptor err: ' + err);
//  } else {
//    console.log('getStringDescriptor result: ' + data);
//  }
//});

// getString
const DEVICE_TO_HOST = 1 << 7; // Bit 7 (MSB)
const STANDARD = 0; // Bits 6..5
const RECIPIENT_DEVICE = 0; // Bits 4..0
const requestType = DEVICE_TO_HOST | STANDARD | RECIPIENT_DEVICE;
console.log('requestType: ' + requestType.toString(16));
stm32Device.controlTransfer(requestType, // bmRequestType
6, // bRequest
0x300, // wValue
0, // wIndex
255, // length
(err, data) => {
  if (err) {
    console.log('usb Device.controlTransfer error: ' + err);
  } else {
    console.log('usb Device.controlTransfer data: ');
    console.log(data);
  }
});

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