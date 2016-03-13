"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * UsbDevice
 */
class UsbDevice {
  constructor(device) {
    this.handle = device;
    device.open();
    this.iface = device.interface(0);
    this.iface.claim();
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
        _this.handle.controlTransfer(request.requestType, request.request, request.value, request.index, request.dataOrLength, cb);
      });
    })();
  }
}
exports.UsbDevice = UsbDevice;