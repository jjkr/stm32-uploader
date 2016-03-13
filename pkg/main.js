'use strict';

let main = (() => {
  var ref = _asyncToGenerator(function* () {
    //usb.setDebugLevel(4);  // debug

    const STMICRO_VENDOR_ID = 0x0483;
    const devices = usb.getDeviceList();
    const stm32Device = devices.find(function (d) {
      return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID;
    });

    if (!stm32Device) {
      throw Error('Missing STM32 device');
    }

    console.log('opening device');
    stm32Device.open();

    const iface = stm32Device.interface(0);

    //console.log('iface');
    //console.log(iface);

    const flashDescriptorIndex = iface.descriptor.iInterface;
    const usbDev = new _usbDevice.UsbDevice(stm32Device);

    const flashDescriptor = yield usbDev.getStringDescriptor(flashDescriptorIndex);

    //console.log('JJK flash descriptor:');
    //console.log(flashDescriptor);

    console.log(parseFlashDescriptor(flashDescriptor));

    console.log('end of main');
  });

  return function main() {
    return ref.apply(this, arguments);
  };
})();

var _usb = require('usb');

var usb = _interopRequireWildcard(_usb);

var _usbDevice = require('./usb-device');

var _usbRequest = require('./usb-request');

var usbRequest = _interopRequireWildcard(_usbRequest);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

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
  };
}

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});