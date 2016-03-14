'use strict';

let main = (() => {
  var ref = _asyncToGenerator(function* () {
    //usb.setDebugLevel(4);  // debug

    const device = new dfu.DfuDevice(getUsbDevice());
    yield device.resetState();

    const flash = yield device.getFlashInfo();
    printFlash(flash);

    console.log('eraseAll');
    device.eraseAll();

    console.log('end of main');
  });

  return function main() {
    return ref.apply(this, arguments);
  };
})();

var _usb = require('usb');

var usb = _interopRequireWildcard(_usb);

var _usbDfu = require('./usb-dfu');

var dfu = _interopRequireWildcard(_usbDfu);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function getUsbDevice() {
  const STMICRO_VENDOR_ID = 0x0483;
  const devices = usb.getDeviceList();
  const usbDevice = devices.find(d => {
    return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID;
  });

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

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});