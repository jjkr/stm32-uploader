'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UsbDevice = undefined;

var _usb = require('usb');

var usb = _interopRequireWildcard(_usb);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

class UsbRequest {
  constructor(requestType, request, value, dataOrLength) {
    this.requestType = requestType;
    this.request = request;
    this.value = value;
    this.index = index;
    this.dataOrLength = dataOrLength;
  }
}

/**
 * USB Standard Requests
 *
 * ------------------------------------------------------------------------------------------------
 * | bmRequestType | bRequest          | wValue        | wIndex      | wLength    | Data          |
 * ------------------------------------------------------------------------------------------------
 * | 1000 0000b    | GET_STATUS        | Zero          | Zero        | Two        | Device Status |
 * |               | 0x00              |               |             |            |               |
 * |               |                   |               |             |            |               |
 * | 0000 0000b    | CLEAR_FEATURE     | Feature       | Zero        | Zero       | None          |
 * |               | 0x01              | Selector      |             |            |               |
 * |               |                   |               |             |            |               |
 * | 0000 0000b    | SET_FEATURE       | Feature       | Zero        | Zero       | None          |
 * |               | 0x03              | Selector      |             |            |               |
 * |               |                   |               |             |            |               |
 * | 0000 0000b    | SET_ADDRESS       | Device        | Zero        | Zero       | None          |
 * |               | 0x05              | Address       |             |            |               |
 * |               |                   |               |             |            |               |
 * | 1000 0000b    | GET_DESCRIPTOR    | Descriptor    | Zero or     | Descriptor | Descriptor    |
 * |               | 0x06              | Type & Index  | Language ID | Length     |               |
 * |               |                   |               |             |            |               |
 * | 0000 0000b    | SET_DESCRIPTOR    | Descriptor    | Zero or     | Descriptor | Descriptor    |
 * |               | 0x07              | Type & Index  | Language ID | Length     |               |
 * |               |                   |               |             |            |               |
 * | 1000 0000b    | GET_CONFIGURATION | Zero          | Zero        | 1          | Configuration |
 * |               | 0x08              |               |             |            | Value         |
 * |               |                   |               |             |            |               |
 * | 0000 0000b    | SET_CONFIGURATION | Configuration | Zero        | Zero       | None          |
 * |               | 0x09              | Value         |             |            |               |
 * -----------------------------------------------------------------------------------------------
 */

class UsbRequestGetStatus extends UsbRequest {
  constructor() {
    super(0x80, 0, 0, 0, 2);
  }
}

class UsbRequestClearFeature extends UsbRequest {
  constructor(selector) {
    super(0, 1, selector, 0, 0);
  }
}

const DESCRIPTOR_TYPE_DEVICE = 0x0;
const DESCRIPTOR_TYPE_CONFIGURATION = 0x2;
const DESCRIPTOR_TYPE_STRING = 0x3;
const DESCRIPTOR_TYPE_INTERFACE = 0x4;
const DESCRIPTOR_TYPE_ENDPOINT = 0x5;

class UsbRequestGetDescriptor extends UsbRequest {
  constructor(type, index) {
    super(0x80, 6, type << 8 | index, 0, 255);
  }
}

class UsbRequestSetDescriptor extends UsbRequest {
  constructor(type, index, data) {
    super(0x80, 6, type << 8 | index, 0, data);
  }
}

const USB_REQUEST_SET_FEATURE = 0x03;
const USB_REQUEST_SET_ADDRESS = 0x05;
const USB_REQUEST_SET_DESCRIPTOR = 0x07;
const USB_REQUEST_GET_CONFIGURATION = 0x08;
const USB_REQUEST_SET_CONFIGURATION = 0x09;

function requestTypeFor(request) {
  switch (request) {
    case USB_REQUEST_GET_STATUS:
      return 0x80;
    case USB_REQUEST_CLEAR_FEATURE:
    case USB_REQUEST_SET_FEATURE:
      return 0x0;
    case USB_REQUEST_SET_ADDRESS:
    case USB_REQUEST_GET_DESCRIPTOR:
      return 0x80;
    case USB_REQUEST_SET_DESCRIPTOR:
      return 0x0;
    case USB_REQUEST_GET_CONFIGURATION:
      return 0x80;
    case USB_REQUEST_SET_CONFIGURATION:
      return 0x0;
  }
}

/**
 * DFU USB Requests
 *
 * From DFU 1.1 Spec
 * Table 3.1 Summary of DFU Class-Specific Requests
 *
 * | bmRequestType | bRequest      | wValue    | wIndex    | wLength | Data
 * ----------------------------------------------------------------------------
 * | 0010 0001b    | DFU_DETACH    | wTimeout  | Interface | Zero    | None
 * | 0010 0001b    | DFU_DNLOAD    | wBlockNum | Interface | Length  | Firmware
 * | 1010 0001b    | DFU_UPLOAD    | Zero      | Interface | Length  | Firmware
 * | 0010 0001b    | DFU_GETSTATUS | Zero      | Interface | 6       | Status
 * | 0010 0001b    | DFU_CLRSTATUS | Zero      | Interface | Zero    | None
 * | 0010 0001b    | DFU_GETSTATE  | Zero      | Interface | 1       | State
 * | 0010 0001b    | DFU_ABORT     | Zero      | Interface | Zero    | None
 */

// OUT
// Requests the device to leave DFU mode and enter the application.
const DFU_DETACH = 0x00;

// OUT
// Requests data transfer from Host to the device in order to load them into
// device internal Flash. Includes also erase commands
const DFU_DNLOAD = 0x01;

// IN
// Requests data transfer from device to Host in order to load content of device
// internal Flash into a Host file.
const DFU_UPLOAD = 0x02;

// IN
// Requests device to send status report to the Host (including status resulting
// from the last request execution and the state the device will enter
// immediately after this request).
const DFU_GETSTATUS = 0x03;

// OUT
// Requests device to clear error status and move to next step.
const DFU_CLRSTATUS = 0x04;

// IN
// Requests the device to send only the state it will enter immediately after
// this request.
const DFU_GETSTATE = 0x05;

// OUT
// Requests device to exit the current state/operation and enter idle state
// immediately.
const DFU_ABORT = 0x06;

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

  getDescriptor(index) {
    var _this = this;

    return _asyncToGenerator(function* () {
      console.log('getting descriptor');
      return new Promise(function (resolve, reject) {
        const cb = function cb(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        };
        _this.handle.controlTransfer(requestTypeFor(USB_REQUEST_GET_DESCRIPTOR), USB_REQUEST_GET_DESCRIPTOR, 0x300 | index, 0, 255, cb);
      });
    })();
  }
}
exports.UsbDevice = UsbDevice;