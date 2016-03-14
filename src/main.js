import * as usb from 'usb';
import {DfuDevice} from './usb-dfu';

async function main() {
  //usb.setDebugLevel(4);  // debug

  const STMICRO_VENDOR_ID = 0x0483;
  const devices = usb.getDeviceList();
  const usbDevice =
      devices.find(d => { return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID; });

  if (!usbDevice) {
    throw Error('Missing STM32 USB device');
  }

  const dfuDevice = new DfuDevice(usbDevice);

  const command = await dfuDevice.getCommands();
  console.log('command');
  console.log(command);

  const status = await dfuDevice.getStatus();
  console.log('status');
  console.log(status);

  //console.log('JJK flash descriptor:');
  //console.log(usbDevice);
  //const manufacturer = await dfuDevice.getManufacturer();
  //const product = await dfuDevice.getProduct();
  //console.log('JJK manufacturer: ' + manufacturer);
  //console.log('JJK product: ' + product);

  const flash = await dfuDevice.getFlashInfo();
  console.log('flash');
  console.log(flash);

  console.log('erasing');
  await dfuDevice.eraseAll();
  

  console.log('end of main');
}

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});
