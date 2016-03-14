import * as usb from 'usb';
import {Stm32UsbDfuDevice} from './usb-stm32-dfu';
import {DfuUsbDevice, DFU_STM32_ERASE} from './usb-dfu';
import * as usbRequest from './usb-request';

async function main() {
  //usb.setDebugLevel(4);  // debug

  const STMICRO_VENDOR_ID = 0x0483;
  const devices = usb.getDeviceList();
  const stm32Device =
      devices.find(d => { return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID; });

  if (!stm32Device) {
    throw Error('Missing STM32 device');
  }

  console.log('opening device');
  stm32Device.open();

  const iface = stm32Device.interface(0);

  //console.log('iface');
  //console.log(iface);

  const flashDescriptorIndex = iface.descriptor.iInterface;
  const dev = new Stm32UsbDfuDevice(new DfuUsbDevice(stm32Device));

  //console.log('JJK flash descriptor:');
  //console.log(stm32Device);
  const manufacturer = await dev.getManufacturer();
  const product = await dev.getProduct();
  console.log('JJK manufacturer: ' + manufacturer);
  console.log('JJK product: ' + product);

  const flash = await dev.getFlashInfo();
  console.log('flash');
  console.log(flash);

  console.log('erasing');
  await dev.eraseAll();
  

  console.log('end of main');
}

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});
