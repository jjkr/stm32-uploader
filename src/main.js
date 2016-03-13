import * as usb from 'usb';
import * as _ from 'lodash';


//usb.setDebugLevel(0);
usb.setDebugLevel(4); // debug

const devices = usb.getDeviceList();
//console.log(devices);

const STMICRO_VENDOR_ID = 0x0483;
const SILICON_LAB_VENDOR_ID = 0x10c4;
const stm32Device = devices.find(
  d => { return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID; });

console.log('found stm32 device:');
console.log(stm32Device.deviceDescriptor);
console.log('vendorid: ' + stm32Device.deviceDescriptor.idVendor.toString(16));
console.log('productid: ' +
            stm32Device.deviceDescriptor.idProduct.toString(16));

//console.log('opening');
stm32Device.open();

//console.log('claiming interface...');
const iface = stm32Device.interface(0);
iface.claim();

//console.log('iface');
//console.log(iface);


//stm32Device.getStringDescriptor(0, (err, data) => {
//  if (err) {
//    console.log('getStringDescriptor err: ' + err);
//  } else {
//    console.log('getStringDescriptor result: ' + data);
//  }
//});


// getString
const DEVICE_TO_HOST = 1 << 7;  // Bit 7 (MSB)
const STANDARD = 0;             // Bits 6..5
const RECIPIENT_DEVICE = 0;     // Bits 4..0
const requestType = DEVICE_TO_HOST | STANDARD | RECIPIENT_DEVICE;
const iIndex = iface.descriptor.iInterface;
console.log('requestType: ' + requestType.toString(16));
stm32Device.controlTransfer(requestType,     // bmRequestType
                            6,               // bRequest
                            0x300 | iIndex,  // wValue
                            0,               // wIndex
                            255,             // length
                            (err, data) => {
                              if (err) {
                                console.log(
                                  'usb Device.controlTransfer error: ' + err);
                              } else {
                                console.log(
                                  'usb Device.controlTransfer data: ');
                                console.log(data.toString());
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
