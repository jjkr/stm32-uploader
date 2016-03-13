import * as usb from 'usb';

/**
 * USB Standard Request Codes
 */
const GET_STATUS = 0;
const CLEAR_FEATURE = 0;

class Device {
  constructor(handle) {
    this.handle = handle;
  }

  private handle;
}


