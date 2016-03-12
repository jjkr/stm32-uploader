import * as usb from 'usb';
import * as _ from 'lodash';

const devices = usb.getDeviceList();

const stm32Device =
    devices.filter(d => { return d.deviceDescriptor.idVendor === 0x10c4; })[0];

console.log(stm32Device);
console.log('product: ' + stm32Device.deviceDescriptor.idProduct.toString(16));
console.log(usb);

//for (const d of devices.filter(
//         d => { return d.deviceDescriptor.idVendor === 0x10c4; })) {
//  //console.log(d.deviceDescriptor.bDeviceClass.toString(16));
//
//  console.log('vendor: ' + d.deviceDescriptor.idVendor.toString(16) +
//              ' product: ' + d.deviceDescriptor.idProduct.toString(16));
//}
