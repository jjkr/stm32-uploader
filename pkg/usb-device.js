'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UsbDevice = undefined;

var _usbRequest = require('./usb-request');

var usbRequest = _interopRequireWildcard(_usbRequest);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * UsbDevice
 */
class UsbDevice {
  constructor(device) {
    this.device = device;
    device.open();
  }

  claimInterface(i) {
    device.interface(i).claim();
  }

  claimInterfaces() {
    for (const i of device.interfaces) {
      i.claim();
    }
  }

  sendRequest(request) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return new Promise(function (resolve, reject) {
        const cb = function cb(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        };
        _this.device.controlTransfer(request.requestType, request.request, request.value, request.index, request.dataOrLength, cb);
      });
    })();
  }

  getDescriptor(type, index) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2.sendRequest(new usbRequest.DeviceGetDescriptor(type, index));
    })();
  }

  getStringDescriptor(index) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const descriptor = yield _this3.getDescriptor(usbRequest.DESCRIPTOR_TYPE_STRING, index);
      return descriptor.toString('utf16le');
    })();
  }
}
exports.UsbDevice = UsbDevice;