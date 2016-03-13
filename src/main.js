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
  if (splitStr[0].indexOf('@Internal Flash') === -1) {
    throw new Error('Bad Flash descriptor: ' + descriptor);
  }

  const startAddress = parseInt(splitStr[1]);

  const sectors = [];
  var totalSize = 0;
  for (const s of splitStr[2].split(',')) {
    const spl = s.split('*');

    if (spl.length < 2) {
      throw new Error('Bad page descriptor, no asterisk: ' + s);
    }

    const numPages = parseInt(spl[0]);
    var pageSize = parseInt(spl[1]);

    switch (spl[1].slice(-2, -1)[0]) {
        case 'M':
            pageSize *= 1024 * 1024;
            break;
        case 'K':
            pageSize *= 1024;
            break;
        default:
            throw new Error('Bad pageSize: ' + spl[1]);
    }

    const sectorSize = numPages * pageSize;
    sectors.push({
      numPages: numPages,
      pageSize: pageSize,
      startAddress: startAddress + totalSize,
      totalSize: sectorSize
    });
    totalSize += sectorSize;
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

  if (!stm32Device) {
    throw Error('Missing STM32 device');
  }

  console.log('opening device');
  stm32Device.open();

  const iface = stm32Device.interface(0);

  //console.log('iface');
  //console.log(iface);

  const flashDescriptorIndex = iface.descriptor.iInterface;
  const usbDev = new UsbDevice(stm32Device);

  const flashDescriptor = await usbDev.getStringDescriptor(flashDescriptorIndex);

  //console.log('JJK flash descriptor:');
  //console.log(flashDescriptor);

  console.log(parseFlashDescriptor(flashDescriptor));

  console.log('end of main');
}

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});
