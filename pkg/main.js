'use strict';

let main = (() => {
  var ref = _asyncToGenerator(function* () {
    // usb.setDebugLevel(0);
    //usb.setDebugLevel(4);  // debug

    const STMICRO_VENDOR_ID = 0x0483;
    const devices = usb.getDeviceList();
    const stm32Device = devices.find(function (d) {
      return d.deviceDescriptor.idVendor === STMICRO_VENDOR_ID;
    });

    // console.log('found stm32 device:');
    // console.log(stm32Device.deviceDescriptor);
    // console.log('vendorid: ' + stm32Device.deviceDescriptor.idVendor.toString(16));
    // console.log('productid: ' +
    //            stm32Device.deviceDescriptor.idProduct.toString(16));

    const usbDev = new _usbDevice.UsbDevice(stm32Device);
    const iface = stm32Device.interface(0);
    const index = iface.descriptor.iInterface;

    console.log('calling getDescriptor(' + index + ')');
    const request = new usbRequest.DeviceGetDescriptor(usbRequest.DESCRIPTOR_TYPE_STRING, index);

    try {
      const data = yield usbDev.sendRequest(request);
      console.log('chip data: ' + data);
    } catch (e) {
      console.log('getDescriptor err: ' + err);
    }

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

main().catch(err => {
  console.log('CAUGHT top level error: ');
  console.log(err);
});