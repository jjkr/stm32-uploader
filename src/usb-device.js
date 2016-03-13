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
