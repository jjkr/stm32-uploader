'use strict';

let main = (() => {
  var ref = _asyncToGenerator(function* () {
    //usb.setDebugLevel(4);  // debug

    const STMICRO_VENDOR_ID = 0x0483;
    const devices = usb.getDeviceList();
    for (const d of devices) {
      const usbDev = new UsbDevice(d);
      console.log(usbDev.getManufacturer());
    }
    const stm32Device = devices.find(function (d) {
      return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID;
    });

    if (!stm32Device) {
      throw Error('Missing STM32 device');
    }

    //console.log('iface');
    //console.log(iface);

    const dev = new Stm32UsbDfuDevice(new _usbDfu.DfuUsbDevice(stm32Device));

    //console.log('JJK flash descriptor:');
    //console.log(stm32Device);
    //const manufacturer = await dev.getManufacturer();
    //const product = await dev.getProduct();
    //console.log('JJK manufacturer: ' + manufacturer);
    //console.log('JJK product: ' + product);

    const flash = yield dev.getFlashInfo();
    console.log('flash');
    console.log(flash);

    console.log('erasing');
    yield dev.eraseAll();

    console.log('end of main');
  });

  return function main() {
    return ref.apply(this, arguments);
  };
})();

var _usb = require('usb');

var usb = _interopRequireWildcard(_usb);

var _usbDfu = require('./usb-dfu');

var _usbRequest = require('./usb-request');

var usbRequest = _interopRequireWildcard(_usbRequest);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});