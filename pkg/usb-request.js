"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

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

  send(device) {
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

exports.UsbRequest = UsbRequest; /**
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

exports.DeviceGetStatus = DeviceGetStatus;
class DeviceClearFeature extends UsbRequest {
  constructor(selector) {
    super(0, 1, selector, 0, 0);
  }
}
exports.DeviceClearFeature = DeviceClearFeature;
class DeviceSetFeature extends UsbRequest {
  constructor(selector) {
    super(0, 3, selector, 0, 0);
  }
}

exports.DeviceSetFeature = DeviceSetFeature;
class DeviceSetAddress extends UsbRequest {
  constructor(addr) {
    super(0, 5, addr, 0, 0);
  }
}

exports.DeviceSetAddress = DeviceSetAddress;
const DESCRIPTOR_TYPE_DEVICE = exports.DESCRIPTOR_TYPE_DEVICE = 0x0;
const DESCRIPTOR_TYPE_CONFIGURATION = exports.DESCRIPTOR_TYPE_CONFIGURATION = 0x2;
const DESCRIPTOR_TYPE_STRING = exports.DESCRIPTOR_TYPE_STRING = 0x3;
const DESCRIPTOR_TYPE_INTERFACE = exports.DESCRIPTOR_TYPE_INTERFACE = 0x4;
const DESCRIPTOR_TYPE_ENDPOINT = exports.DESCRIPTOR_TYPE_ENDPOINT = 0x5;
class DeviceGetDescriptor extends UsbRequest {
  constructor(type, index) {
    super(0x80, 6, type << 8 | index, 0, 255);
  }
}
exports.DeviceGetDescriptor = DeviceGetDescriptor;
class DeviceSetDescriptor extends UsbRequest {
  constructor(type, index, data) {
    super(0, 7, type << 8 | index, 0, data);
  }
}

exports.DeviceSetDescriptor = DeviceSetDescriptor;
class DeviceGetConfiguration extends UsbRequest {
  constructor(val) {
    super(0x80, 8, val, 0, 0);
  }
}
exports.DeviceGetConfiguration = DeviceGetConfiguration;
class DeviceSetConfiguration extends UsbRequest {
  constructor(val) {
    super(0x80, 8, val, 0, 0);
  }
}
exports.DeviceSetConfiguration = DeviceSetConfiguration;