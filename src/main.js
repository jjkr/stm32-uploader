import * as usb from 'usb';
import {UsbDevice} from './usb-device';
import * as usbRequest from './usb-request';

/**
 * Parse a flash description string from an STM32 into an object
 *
 * Example string:
 * @Internal Flash  /0x08000000/128*0002Kg
 */
function parseFlashDescriptor(descriptor) {
  const splitStr = descriptor.split('/');
  if (splitStr.length < 3) {
    throw new Error('bad format for flash descriptor: ' + descriptor);
  }
  console.log('jjk splitstr:');
  console.log(splitStr[0]);
  for (const c of splitStr[0]) {
    console.log('jjk c: ' + c);
  }
  if (!splitStr[0].startsWith('@Internal Flash')) {
    throw new Error('Bad Flash descriptor: ' + descriptor);
  }

  const startAddress = parseInt(splitStr[1]);

  const sectors = [];
  for (const s of splitStr[2].split(',')) {
    const spl = s.split('*');
    const numPages = spl[0];
    const pageSize = spl[1];

    sectors.push({
      numPages: parseInt(numPages.toString()),
      pageSize: pageSize.toString()
    });
  }

  return {
    startAddress: startAddress,
    sectors: sectors
  }
}

async function main() {
  //usb.setDebugLevel(4);  // debug

  const STMICRO_VENDOR_ID = 0x0483;
  const devices = usb.getDeviceList();
  const stm32Device =
      devices.find(d => { return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID; });

  console.log('opening device');
  stm32Device.open();

  if (!stm32Device) {
    throw Error('Missing STM32 device');
  }

  // console.log('found stm32 device:');
  // console.log(stm32Device.deviceDescriptor);
  // console.log('vendorid: ' + stm32Device.deviceDescriptor.idVendor.toString(16));
  // console.log('productid: ' +
  //            stm32Device.deviceDescriptor.idProduct.toString(16));

  const iface = stm32Device.interface(0);
  console.log('iface');
  console.log(iface);
  const flashDescriptorIndex = iface.descriptor.iInterface;
  const usbDev = new UsbDevice(stm32Device);

  const flashDescriptor = await usbDev.getStringDescriptor(flashDescriptorIndex);

  console.log('JJK flash descriptor:');
  console.log(flashDescriptor);

  console.log(parseFlashDescriptor(flashDescriptor.substr(1)));
  //const matches = flashDescriptor.toString().match(flashRegex);

//  const splitFlash = flashDescriptor.split('/');
//  console.log('flash addr: ' + splitFlash[1]);
//  console.log('flash banks: ' + splitFlash[2]);
  //console.log(matches);

  console.log('end of main');
}

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});
