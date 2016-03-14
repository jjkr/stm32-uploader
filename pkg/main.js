'use strict';

let main = (() => {
  var ref = _asyncToGenerator(function* () {
    //usb.setDebugLevel(4);  // debug

    const STMICRO_VENDOR_ID = 0x0483;
    const devices = usb.getDeviceList();
    const usbDevice = devices.find(function (d) {
      return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID;
    });

    if (!usbDevice) {
      throw Error('Missing STM32 USB device');
    }

    const dfuDevice = new _usbDfu.DfuDevice(usbDevice);

    yield dfuDevice.clearStatus();

    const status = yield dfuDevice.getStatus();
    console.log('status');
    console.log(status);

    //console.log('sending DETACH');
    //const detachResponse = await dfuDevice.detach();
    //console.log('DETACH response');
    //console.log(detachResponse);

    //await new Promise((resolve, reject) => {
    //  usbDevice.reset(err => {
    //    if (err) {
    //      reject(err);
    //    } else {
    //      resolve();
    //    }
    //  });
    //});

    const command = yield dfuDevice.getCommands();
    console.log('command');
    console.log(command);

    //console.log('JJK flash descriptor:');
    //console.log(usbDevice);
    //const manufacturer = await dfuDevice.getManufacturer();
    //const product = await dfuDevice.getProduct();
    //console.log('JJK manufacturer: ' + manufacturer);
    //console.log('JJK product: ' + product);

    //const flash = await dfuDevice.getFlashInfo();
    //console.log('flash');
    //console.log(flash);

    //console.log('erasing');
    //await dfuDevice.eraseAll();

    console.log('end of main');
  });

  return function main() {
    return ref.apply(this, arguments);
  };
})();

var _usb = require('usb');

var usb = _interopRequireWildcard(_usb);

var _usbDfu = require('./usb-dfu');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});