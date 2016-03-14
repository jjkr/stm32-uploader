import * as usb from 'usb';
import * as dfu from './usb-dfu';

function getDevice() {
  const STMICRO_VENDOR_ID = 0x0483;
  const devices = usb.getDeviceList();
  const usbDevice =
      devices.find(d => { return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID; });

  if (!usbDevice) {
    throw Error('Missing STM32 USB device');
  }

  return usbDevice;
}

async function main() {
  //usb.setDebugLevel(4);  // debug

  const device = new dfu.DfuDevice(getDevice());
  await device.resetState();

  console.log('end of main');
}

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});
