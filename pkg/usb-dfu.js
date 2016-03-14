'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DfuUsbDevice = undefined;

var _usbDevice = require('./usb-device');

var _usbRequest = require('./usb-request');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * Device Firmware Update (DFU) USB Requests
 *
 * From DFU 1.1 Spec
 * Table 3.1 Summary of DFU Class-Specific Requests
 *
 * -------------------------------------------------------------------------------------
 * | bmRequestType | bRequest             | wValue    | wIndex    | wLength | Data     |
 * -------------------------------------------------------------------------------------
 * | 0010 0001b    | DFU_DETACH (0x00)    | wTimeout  | Interface | Zero    | None     |
 * | 0010 0001b    | DFU_DNLOAD (0x01)    | wBlockNum | Interface | Length  | Firmware |
 * | 1010 0001b    | DFU_UPLOAD (0x02)    | Zero      | Interface | Length  | Firmware |
 * | 0010 0001b    | DFU_GETSTATUS (0x03) | Zero      | Interface | 6       | Status   |
 * | 0010 0001b    | DFU_CLRSTATUS (0x04) | Zero      | Interface | Zero    | None     |
 * | 0010 0001b    | DFU_GETSTATE (0x05)  | Zero      | Interface | 1       | State    |
 * | 0010 0001b    | DFU_ABORT (0x06)     | Zero      | Interface | Zero    | None     |
 * -------------------------------------------------------------------------------------
 */

// Requests the device to leave DFU mode and enter the application.
const DFU_DETACH = 0x00;

// Requests data transfer from Host to the device in order to load them into
// device internal Flash. Includes also erase commands
class DfuDownloadRequest extends _usbRequest.UsbRequest {
  constructor(blockNum, index, fw) {
    super(0x21, 1, blockNum, index, fw);
  }
}

// Requests data transfer from device to Host in order to load content of device
// internal Flash into a Host file.
const DFU_UPLOAD = 0x02;

// Requests device to send status report to the Host (including status resulting
// from the last request execution and the state the device will enter
// immediately after this request).
class DfuGetStatus extends _usbRequest.UsbRequest {
  constructor(index) {
    super(0x21, 3, 0, index, 6);
  }
}

// Requests device to clear error status and move to next step.
const DFU_CLRSTATUS = 0x04;

// Requests the device to send only the state it will enter immediately after
// this request.
const DFU_GETSTATE = 0x05;

// Requests device to exit the current state/operation and enter idle state
// immediately.
const DFU_ABORT = 0x06;

class DfuUsbDevice extends _usbDevice.UsbDevice {
  constructor(device) {
    super(device);
  }

  download(blockNum, index, fw) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return _this.sendRequest(new DfuDownloadRequest(blockNum, index, fw));
    })();
  }

  getStatus(index) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2.sendRequest(new DfuGetStatus(index));
    })();
  }
}
exports.DfuUsbDevice = DfuUsbDevice;