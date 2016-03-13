import * as usb from 'usb';

/**
 * USB Standard Requests
 *
 * | bmRequestType | bRequest                  | wValue          | wIndex       | wLength     | Data
 * ------------------------------------------------------------------------------------------------------------------
 * | 1000 0000b    | GET_STATUS (0x00)         | Zero            | Zero         | Two         | Device Status
 * |               |                           |                 |              |             |
 * | 0000 0000b    | CLEAR_FEATURE (0x01)      | Feature         | Zero         | Zero        | None
 * |               |                           | Selector        |              |             |
 * |               |                           |                 |              |             |
 * | 0000 0000b    | SET_FEATURE (0x03)        | Feature         | Zero         | Zero        | None
 * |               |                           | Selector        |              |             |
 * |               |                           |                 |              |             |
 * | 0000 0000b    | SET_ADDRESS (0x05)        | Device Address  | Zero         | Zero        | None
 * |               |                           |                 |              |             |
 * | 1000 0000b    | GET_DESCRIPTOR (0x06)     | Descriptor      | Zero or      | Descriptor  | Length Descriptor
 * |               |                           | Type & Index    | Language ID  |             |
 * |               |                           |                 |              |             |
 * | 0000 0000b    | SET_DESCRIPTOR (0x07)     | Descriptor      | Zero or      | Descriptor  | Length Descriptor
 * |               |                           | Type & Index    | Language ID  |             |
 * |               |                           |                 |              |             |
 * | 1000 0000b    | GET_CONFIGURATION (0x08)  | Zero            | Zero         | 1           | Configuration Value
 * |               |                           |                 |              |             |
 * | 0000 0000b    | SET_CONFIGURATION (0x09)  | Configuration   | Zero         | Zero        | None
 * |               |                           | Value           |              |             |
 */

const USB_REQUEST_GET_STATUS = 0x00;
const USB_REQUEST_CLEAR_FEATURE = 0x01;
const USB_REQUEST_SET_FEATURE = 0x03;
const USB_REQUEST_SET_ADDRESS = 0x05;
const USB_REQUEST_GET_DESCRIPTOR = 0x06;
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
 * | bmRequestType | bRequest       | wValue     | wIndex     | wLength  | Data
 * ---------------------------------------------------------------------------------
 * | 0010 0001b    | DFU_DETACH     | wTimeout   | Interface  | Zero     | None
 * | 0010 0001b    | DFU_DNLOAD     | wBlockNum  | Interface  | Length   | Firmware
 * | 1010 0001b    | DFU_UPLOAD     | Zero       | Interface  | Length   | Firmware
 * | 0010 0001b    | DFU_GETSTATUS  | Zero       | Interface  | 6        | Status
 * | 0010 0001b    | DFU_CLRSTATUS  | Zero       | Interface  | Zero     | None
 * | 0010 0001b    | DFU_GETSTATE   | Zero       | Interface  | 1        | State
 * | 0010 0001b    | DFU_ABORT      | Zero       | Interface  | Zero     | None
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
  constructor(handle) {
    this.handle = handle;
  }

  async getDescriptor(index) {
    return new Promise((reject, resolve) => {
      const cb = (err, data) => { if (err) { reject(err); } else {resolve(data); }
  };
  //    handle.controlTransfer(requestTypeFor(USB_REQUEST_GET_DESCRIPTOR),
  //                           USB_REQUEST_GET_DESCRIPTOR, 0x300 | index, 0,
  //                           255, (err, data) => {
  //})
  //});
});
}

