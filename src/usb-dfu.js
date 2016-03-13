import * as usb from 'usb';

export class UsbRequest {
  constructor(requestType, request, value, index, dataOrLength) {
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

export class UsbRequestGetStatus extends UsbRequest {
  constructor() { super(0x80, 0, 0, 0, 2); }
}

export class UsbRequestClearFeature extends UsbRequest {
  constructor(selector) { super(0, 1, selector, 0, 0); }
}

export const DESCRIPTOR_TYPE_DEVICE = 0x0;
export const DESCRIPTOR_TYPE_CONFIGURATION = 0x2;
export const DESCRIPTOR_TYPE_STRING = 0x3;
export const DESCRIPTOR_TYPE_INTERFACE = 0x4;
export const DESCRIPTOR_TYPE_ENDPOINT = 0x5;

export class UsbRequestGetDescriptor extends UsbRequest {
  constructor(type, index) { super(0x80, 6, (type << 8) | index, 0, 255); }
}

export class UsbRequestSetDescriptor extends UsbRequest {
  constructor(type, index, data) { super(0, 7, (type << 8) | index, 0, data); }
}

const USB_REQUEST_SET_FEATURE = 0x03;
const USB_REQUEST_SET_ADDRESS = 0x05;
const USB_REQUEST_SET_DESCRIPTOR = 0x07;
const USB_REQUEST_GET_CONFIGURATION = 0x08;
const USB_REQUEST_SET_CONFIGURATION = 0x09;

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
export class UsbDevice {
  constructor(device) {
    this.handle = device;
    device.open();
    this.iface = device.interface(0);
    this.iface.claim();
  }

  async sendRequest(request) {
    return new Promise((resolve, reject) => {
      const cb = (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      };
      this.handle.controlTransfer(request.requestType, request.request, request.value,
                                  request.index, request.dataOrLength, cb);
    });
  }
}
