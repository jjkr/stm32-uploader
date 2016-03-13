import * as usb from 'usb';
import {UsbDevice} from './usb-device';
import * as usbRequest from './usb-request';

async function main() {
  // usb.setDebugLevel(0);
  //usb.setDebugLevel(4);  // debug

  const STMICRO_VENDOR_ID = 0x0483;
  const devices = usb.getDeviceList();
  const stm32Device =
      devices.find(d => { return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID; });

  // console.log('found stm32 device:');
  // console.log(stm32Device.deviceDescriptor);
  // console.log('vendorid: ' + stm32Device.deviceDescriptor.idVendor.toString(16));
  // console.log('productid: ' +
  //            stm32Device.deviceDescriptor.idProduct.toString(16));

  const usbDev = new UsbDevice(stm32Device);
  const iface = stm32Device.interface(0);
  const index = iface.descriptor.iInterface;

  console.log('calling getDescriptor(' + index + ')');
  const request = new usbRequest.DeviceGetDescriptor(usbRequest.DESCRIPTOR_TYPE_STRING, index);

  try {
    const data = await usbDev.sendRequest(request);
    console.log('chip data: ' + data);
  } catch (e) {
    console.log('getDescriptor err: ' + err);
  }

  console.log('end of main');
}

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});
