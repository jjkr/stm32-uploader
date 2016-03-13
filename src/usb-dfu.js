import * as usb from 'usb';

////////////////////////////////////////////////////////////////////////////////
//
// Requests
//
// Table 3 from STMicro USB DFU protocol doc
//
// bmRequest  bRequest       wValue     wIndex     wLength  Data
// 00100001b  DFU_DETACH     wTimeout   Interface  Zero     None
// 00100001b  DFU_DNLOAD     wBlockNum  Interface  Length   Firmware
// 10100001b  DFU_UPLOAD     Zero       Interface  Length   Firmware
// 00100001b  DFU_GETSTATUS  Zero       Interface  6        Status
// 00100001b  DFU_CLRSTATUS  Zero       Interface  Zero     None
// 00100001b  DFU_GETSTATE   Zero       Interface  1        State
// 00100001b  DFU_ABORT      Zero       Interface  Zero     None
//
////////////////////////////////////////////////////////////////////////////////

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


////////////////////////////////////////////////////////////////////////////////
//
//
//
//
//
//
////////////////////////////////////////////////////////////////////////////////
