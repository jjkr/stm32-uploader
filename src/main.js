import * as usb from 'usb';
import * as dfu from './usb-dfu';

function getUsbDevice() {
  const STMICRO_VENDOR_ID = 0x0483;
  const devices = usb.getDeviceList();
  const usbDevice =
      devices.find(d => { return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID; });

  if (!usbDevice) {
    throw Error('Missing STM32 USB device');
  }

  return usbDevice;
}

function printFlash(flash) {
  console.log('FLASH INFO');
  console.log(' start address: 0x' + flash.startAddress.toString(16));
  let sectorNum = 1;
  for (const s of flash.sectors) {
    console.log(' sector' + sectorNum);
    console.log('  pages: ' + s.pageSize + '*' + s.numPages);
    console.log('  startAddress: 0x' + s.startAddress.toString(16));
    console.log('  totalSize: ' + s.totalSize);
  }
}

async function main() {
  //usb.setDebugLevel(4);  // debug

  const device = new dfu.DfuDevice(getUsbDevice());
  await device.resetState();

  const flash = await device.getFlashInfo();
  printFlash(flash);

  console.log('eraseAll');
  device.eraseAll();

  console.log('end of main');
}

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});
