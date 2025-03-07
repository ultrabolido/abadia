const DiskReader = require('./DiskReader.js');

class DiskImageLoader {
    static readDiskImageToMemory(diskImageData) {
        
        const auxBuffer = new Uint8Array(0xff00);
        const memoryData = new Uint8Array(0x24000);
        const dsk = new DiskReader(new Uint8Array(diskImageData));

        for (let i = 0; i <= 16; i++) {
            dsk.getTrackData(i + 0x01, auxBuffer, i * 0x0f00, 0x0f00);
        }
        
        DiskImageLoader.reOrderAndCopy(auxBuffer, 0x0000, memoryData, 0x00000, 0x4000);    // abadia0.bin
        DiskImageLoader.reOrderAndCopy(auxBuffer, 0x4000, memoryData, 0x0c000, 0x4000);    // abadia3.bin
        DiskImageLoader.reOrderAndCopy(auxBuffer, 0x8000, memoryData, 0x20000, 0x4000);    // abadia8.bin
        DiskImageLoader.reOrderAndCopy(auxBuffer, 0xc000, memoryData, 0x04100, 0x3f00);    // abadia1.bin

        for (let i = 0; i <= 4; i++) {
            dsk.getTrackData(i + 0x12, auxBuffer, i * 0x0f00, 0x0f00);
        }
        DiskImageLoader.reOrderAndCopy(auxBuffer, 0x0000, memoryData, 0x1c000, 0x4000);    // abadia7.bin

        for (let i = 0; i <= 4; i++) {
            dsk.getTrackData(i + 0x17, auxBuffer, i * 0x0f00, 0x0f00);
        }
        DiskImageLoader.reOrderAndCopy(auxBuffer, 0x0000, memoryData, 0x18000, 0x4000);    // abadia6.bin

        for (let i = 0; i <= 5; i++) {
            dsk.getTrackData(i + 0x1c, auxBuffer, i * 0x0f00, 0x0f00);
        }
        DiskImageLoader.reOrderAndCopy(auxBuffer, 0x0000, memoryData, 0x14000, 0x4000);    // abadia5.bin

        for (let i = 0; i <= 4; i++) {
            dsk.getTrackData(i + 0x21, auxBuffer, i * 0x0f00, 0x0f00);
        }
        DiskImageLoader.reOrderAndCopy(auxBuffer, 0x0000, memoryData, 0x08000, 0x4000);    // abadia2.bin

        return memoryData;
    }

    static reOrderAndCopy(src, srcPos, dst, dstPos, size) {
        for (let i = 0; i < size; i++) {
            dst[dstPos + size - i - 1] = src[srcPos + i];
        }
    }
}

module.exports = DiskImageLoader;