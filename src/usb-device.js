import * as usbRequest from './usb-request';

/**
 * UsbDevice
 */
export class UsbDevice {
  constructor(device) {
    this.device = device;
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
      this.device.controlTransfer(request.requestType, request.request, request.value,
                                  request.index, request.dataOrLength, cb);
    });
  }

  async getDescriptor(type: number, index: number) {
    return this.sendRequest(new usbRequest.DeviceGetDescriptor(type, index));
  }

  async getStringDescriptor(index: number) {
    const descriptor = await this.getDescriptor(usbRequest.DESCRIPTOR_TYPE_STRING, index);
    return descriptor.toString('utf16le');
  }
}
