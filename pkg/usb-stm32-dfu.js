'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const DFU_STM32_SET_ADDRESS_POINTER = 0x21;
const DFU_STM32_ERASE = 0x41;
const DFU_STM32_READ_UNPROTECT = 0x92;

class UsbDfuStm32Device {
  constructor(dfuDevice) {
    this.dfuDevice = dfuDevice;
    dfuDevice.open();
    dfuDevice.claimInterface(0);
  }

  getProduct() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const productIndex = _this.dfuDevice.device.deviceDescriptor.iProduct;
      const product = yield _this.dfuDevice.getStringDescriptor(productIndex);
      return product.slice(1);
    })();
  }

  getFlashInfo() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const descriptorIndex = _this2.dfuDevice.device.interface(0).descriptor.iInterface;
      const flashDescriptor = yield _this2.dfuDevice.getStringDescriptor(descriptorIndex);
      return _this2._parseFlashDescriptor(flashDescriptor);
    })();
  }

  /**
   * Erase the entire flash and RAM
   */
  eraseAll() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      try {
        yield _this3.dfuDevice.download(0, 0, new Buffer([DFU_STM32_ERASE]));
      } catch (err) {
        // expect a busy here
        console.log('caught expected dev.download err: ' + err);
      }
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
exports.UsbDfuStm32Device = UsbDfuStm32Device;