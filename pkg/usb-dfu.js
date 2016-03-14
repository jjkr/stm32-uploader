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
 * | 0010 0001b    | DFU_GETSTATUS (0x03) | Zero      | Interface | 6       | Status   |
 * | 0010 0001b    | DFU_CLRSTATUS (0x04) | Zero      | Interface | Zero    | None     |
 * | 0010 0001b    | DFU_GETSTATE (0x05)  | Zero      | Interface | 1       | State    |
 * | 0010 0001b    | DFU_ABORT (0x06)     | Zero      | Interface | Zero    | None     |
 * -------------------------------------------------------------------------------------
 */

// Requests the device to leave DFU mode and enter the application.
class DfuDetach extends UsbRequest {
  constructor(timeout, index) {
    super(0x21, 0, timeout, index, 0);
  }
}

// Requests data transfer from Host to the device in order to load them into
// device internal Flash. Includes also erase commands
class DfuDownload extends UsbRequest {
  constructor(blockNum, index, fw) {
    super(0x21, 1, blockNum, index, fw);
  }
}

// Requests data transfer from device to Host in order to load content of device
// internal Flash into a Host file.
class DfuUpload extends UsbRequest {
  constructor(index) {
    super(0xa1, 2, 0, index, 255);
  }
}

// Requests device to send status report to the Host (including status resulting
// from the last request execution and the state the device will enter
// immediately after this request).
class DfuGetStatus extends UsbRequest {
  constructor(index) {
    super(0x21, 3, 0, index, 6);
  }
}

// Requests device to clear error status and move to next step.
class DfuClearStatus extends UsbRequest {
  constructor(index) {
    super(0x21, 4, 0, index, 0);
  }
}

// Requests the device to send only the state it will enter immediately after
// this request.
class DfuGetState extends UsbRequest {
  constructor(index) {
    super(0x21, 5, 0, index, 1);
  }
}

// Requests device to exit the current state/operation and enter idle state
// immediately.
class DfuAbort extends UsbRequest {
  constructor(index) {
    super(0x21, 6, 0, index, 0);
  }
}

/**
 * DfuDevice implements the USB DFU protocol for STM32 bootloaders
 */
class DfuDevice {
  constructor(dfuDevice) {
    this.dfuDevice = dfuDevice;
    dfuDevice.open();
    dfuDevice.claimInterface(0);
  }

  /**
   * Get information about the flash available on the chip
   * @return object describing the flash, e.g.
   *
   */
  getFlashInfo() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const descriptorIndex = _this.device.interface(0).descriptor.iInterface;
      const flashDescriptor = yield _this.getStringDescriptor(descriptorIndex);
      return _this._parseFlashDescriptor(flashDescriptor);
    })();
  }

  /**
   * Erase the entire flash and RAM
   */
  eraseAll() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      try {
        yield _this2.dfuDevice.download(0, 0, new Buffer([DFU_STM32_ERASE]));
      } catch (err) {
        // TODO why does this throw?
        console.log('caught expected dev.download err: ' + err);
      }
    })();
  }

  _getDescriptor(type, index) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      return _this3.sendRequest(new DeviceGetDescriptor(type, index));
    })();
  }

  _getStringDescriptor(index) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const descriptor = yield _this4._getDescriptor(DESCRIPTOR_TYPE_STRING, index);
      return descriptor.toString('utf16le');
    })();
  }

  _sendRequest(request) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      return new Promise(function (resolve, reject) {
        const cb = function cb(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        };
        _this5.device.controlTransfer(request.requestType, request.request, request.value, request.index, request.dataOrLength, cb);
      });
    })();
  }

  /**
   * Parse a flash description string from an STM32 into an object
   *
   * Example string:
   * @Internal Flash  /0x08000000/128*0002Kg
   */
  _parseFlashDescriptor(descriptor) {
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
}
exports.DfuDevice = DfuDevice;