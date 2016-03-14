'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

//
// usb-dfu.js - Implements the USB DFU protocol for STM32 bootloaders
//

/**
 * USB request class
 *
 * --------------------------------------------------------------------------------
 * | Offset | Field         | Size  | Value    | Description                      |
 * --------------------------------------------------------------------------------
 * | 0      | bmRequestType | 1     | Bit-Map  | D7 Data Phase Transfer Direction |
 * |        |               |       |          | 0 = Host to Device               |
 * |        |               |       |          | 1 = Device to Host               |
 * |        |               |       |          | D6..5 Type                       |
 * |        |               |       |          | 0 = Standard                     |
 * |        |               |       |          | 1 = Class                        |
 * |        |               |       |          | 2 = Vendor                       |
 * |        |               |       |          | 3 = Reserved                     |
 * |        |               |       |          | D4..0 Recipient                  |
 * |        |               |       |          | 0 = Device                       |
 * |        |               |       |          | 1 = Interface                    |
 * |        |               |       |          | 2 = Endpoint                     |
 * |        |               |       |          | 3 = Other                        |
 * |        |               |       |          | 4..31 = Reserved                 |
 * |        |               |       |          |                                  |
 * | 1      | bRequest      | 1     | Value    | Request                          |
 * |        |               |       |          |                                  |
 * | 2      | wValue        | 2     | Value    | Value                            |
 * |        |               |       |          |                                  |
 * | 4      | wIndex        | 2     | Index or | Index                            |
 * |        |               |       | Offset   |                                  |
 * |        |               |       |          |                                  |
 * | 6      | wLength       | 2     | Count    | Number of bytes to transfer if   |
 * |        |               |       |          | there is a data phase            |
 * --------------------------------------------------------------------------------
 */
class UsbRequest {
  constructor(requestType, request, value, index, dataOrLength) {
    this.requestType = requestType;
    this.request = request;
    this.value = value;
    this.index = index;
    this.dataOrLength = dataOrLength;
  }
}

/**
 * USB Standard Device Requests
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

class DeviceGetStatus extends UsbRequest {
  constructor() {
    super(0x80, 0, 0, 0, 2);
  }
}

class DeviceClearFeature extends UsbRequest {
  constructor(selector) {
    super(0, 1, selector, 0, 0);
  }
}
class DeviceSetFeature extends UsbRequest {
  constructor(selector) {
    super(0, 3, selector, 0, 0);
  }
}

class DeviceSetAddress extends UsbRequest {
  constructor(addr) {
    super(0, 5, addr, 0, 0);
  }
}

const DESCRIPTOR_TYPE_DEVICE = 0x0;
const DESCRIPTOR_TYPE_CONFIGURATION = 0x2;
const DESCRIPTOR_TYPE_STRING = 0x3;
const DESCRIPTOR_TYPE_INTERFACE = 0x4;
const DESCRIPTOR_TYPE_ENDPOINT = 0x5;
class DeviceGetDescriptor extends UsbRequest {
  constructor(type, index) {
    super(0x80, 6, type << 8 | index, 0, 255);
  }
}
class DeviceSetDescriptor extends UsbRequest {
  constructor(type, index, data) {
    super(0, 7, type << 8 | index, 0, data);
  }
}

class DeviceGetConfiguration extends UsbRequest {
  constructor(val) {
    super(0x80, 8, val, 0, 0);
  }
}
class DeviceSetConfiguration extends UsbRequest {
  constructor(val) {
    super(0x80, 8, val, 0, 0);
  }
}

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
 * | 1010 0001b    | DFU_GETSTATUS (0x03) | Zero      | Interface | 6       | Status   |
 * | 0010 0001b    | DFU_CLRSTATUS (0x04) | Zero      | Interface | Zero    | None     |
 * | 1010 0001b    | DFU_GETSTATE (0x05)  | Zero      | Interface | 1       | State    |
 * | 0010 0001b    | DFU_ABORT (0x06)     | Zero      | Interface | Zero    | None     |
 * -------------------------------------------------------------------------------------
 */

// Requests the device to leave DFU mode and enter the application.
class DfuDetach extends UsbRequest {
  constructor(timeout) {
    super(0x21, 0, timeout, 0, new Buffer([]));
  }
}

// Requests data transfer from Host to the device in order to load them into
// device internal Flash. Includes also erase commands
const DFU_STM32_SET_ADDRESS_POINTER = 0x21;
const DFU_STM32_ERASE = 0x41;
const DFU_STM32_READ_UNPROTECT = 0x92;
class DfuDownload extends UsbRequest {
  constructor(blockNum, index, fw) {
    super(0x21, 1, blockNum, index, fw);
  }
}

// Requests data transfer from device to Host in order to load content of device
// internal Flash into a Host file.
class DfuUpload extends UsbRequest {
  constructor(value, size) {
    super(0xa1, 2, value, 0, size);
  }
}

// Requests device to send status report to the Host (including status resulting
// from the last request execution and the state the device will enter
// immediately after this request).
class DfuGetStatus extends UsbRequest {
  constructor() {
    super(0xa1, 3, 0, 0, 6);
  }
}

const DFU_STATUS_OK = 0x00;
const DFU_STATUS_ERR_TARGET = 0x01;
const DFU_STATUS_ERR_FILE = 0x02;
const DFU_STATUS_ERR_WRITE = 0x03;
const DFU_STATUS_ERR_ERASE = 0x04;
const DFU_STATUS_ERR_CHECK_ERASE = 0x05;
const DFU_STATUS_ERR_PROG = 0x06;
const DFU_STATUS_ERR_VERIFY = 0x07;
const DFU_STATUS_ERR_ADDRESS = 0x08;
const DFU_STATUS_ERR_NOTDONE = 0x09;
const DFU_STATUS_ERR_FIRMWARE = 0x0a;
const DFU_STATUS_ERR_VENDOR = 0x0b;
const DFU_STATUS_ERR_USBR = 0x0c;
const DFU_STATUS_ERR_POR = 0x0d;
const DFU_STATUS_ERR_UNKNOWN = 0x0e;
const DFU_STATUS_ERR_STALLEDPKT = 0x0f;

const DFU_DEVICE_STATE_APP_IDLE = 0;
const DFU_DEVICE_STATE_APP_DETACH = 1;
const DFU_DEVICE_STATE_DFU_IDLE = 2;
const DFU_DEVICE_STATE_DFU_DNLOAD_SYNC = 3;
const DFU_DEVICE_STATE_DFU_DNBUSY = 4;
const DFU_DEVICE_STATE_DFU_DNLOAD_IDLE = 5;
const DFU_DEVICE_STATE_DFU_MANIFEST_SYNC = 6;
const DFU_DEVICE_STATE_DFU_MANIFEST = 7;
const DFU_DEVICE_STATE_DFU_MANIFEST_WAIT_RESET = 8;
const DFU_DEVICE_STATE_DFU_UPLOAD_IDLE = 9;
const DFU_DEVICE_STATE_DFU_ERR = 10;

// Requests device to clear error status and move to next step.
class DfuClearStatus extends UsbRequest {
  constructor() {
    super(0x21, 4, 0, 0, new Buffer([]));
  }
}

// Requests the device to send only the state it will enter immediately after
// this request.
class DfuGetState extends UsbRequest {
  constructor() {
    super(0xa1, 5, 0, 0, 1);
  }
}

// Requests device to exit the current state/operation and enter idle state
// immediately.
class DfuAbort extends UsbRequest {
  constructor() {
    super(0x21, 6, 0, 0, 0);
  }
}

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

  return { startAddress: startAddress, sectors: sectors };
}

/**
 * DfuDevice implements the USB DFU protocol for STM32 bootloaders
 */
class DfuDevice {
  constructor(device) {
    this.device = device;
    device.open();
    device.interface(0).claim();
  }

  detach(timeout) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return _this._sendRequest(new DfuDetach(timeout));
    })();
  }

  /**
   * Get information about the flash available on the chip
   * @return object describing the flash, e.g.
   *  { startAddress: 0x08000000,
   *    sectors: 
   *      [ { numPages: 128,
   *          pageSize: 2048,
   *          startAddress: 0x08000000,
   *          totalSize: 262144 } ] }
   */
  getFlashInfo() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const descriptorIndex = _this2.device.interface(0).descriptor.iInterface;
      return _this2._getStringDescriptor(descriptorIndex).then(parseFlashDescriptor);
    })();
  }

  /**
   * Erase the entire flash and RAM
   */
  eraseAll() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      yield _this3._sendRequest(new DfuDownload(0, 0, new Buffer([DFU_STM32_ERASE])));
      const status = yield _this3.getStatus();
      console.log('status');
      console.log(status);
      if (status.state !== DFU_DEVICE_STATE_DFU_DNBUSY) {
        throw Error('eraseAll - expected DNBusy state in DFU_GET_STATUS response, got: ' + status.state);
      }
    })();
  }

  getCommands() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      return _this4._sendRequest(new DfuUpload(0, 4));
    })();
  }

  clearStatus() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      return _this5._sendRequest(new DfuClearStatus());
    })();
  }

  getStatus() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const response = yield _this6._sendRequest(new DfuGetStatus());
      const status = {
        status: response[0],
        delay: response[1] | response[2] << 8 | response[3] << 16,
        state: response[4],
        iString: response[5]
      };
      return status;
    })();
  }

  _getDescriptor(type, index) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      return _this7._sendRequest(new DeviceGetDescriptor(type, index));
    })();
  }

  _getStringDescriptor(index) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      const descriptor = yield _this8._getDescriptor(DESCRIPTOR_TYPE_STRING, index);
      return descriptor.toString('utf16le');
    })();
  }

  _sendRequest(request) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      console.log('usb sendRequest');
      console.log(request);
      return new Promise(function (resolve, reject) {
        const cb = function cb(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        };
        _this9.device.controlTransfer(request.requestType, request.request, request.value, request.index, request.dataOrLength, cb);
      });
    })();
  }

  _loadAddress(address) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      const command = [DFU_STM32_SET_ADDRESS_POINTER, address, address >> 8, address >> 16, address >> 24];
      _this10._sendRequest(new DfuDownload(0, 0, new Buffer(command)));
    })();
  }
}
exports.DfuDevice = DfuDevice;