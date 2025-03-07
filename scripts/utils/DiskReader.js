class DiskReader {

    constructor(dskData) {
        this.data = dskData;
        this.numTracks = 0;

        // Check if it's a valid extended dsk file
        const decoder = new TextDecoder('iso-8859-1');
        const name = decoder.decode(this.data.slice(0x00, 0x15));
        if (name !== "EXTENDED CPC DSK File") {
            throw new Error("Invalid disk data: " + name);
        }

        // Get disk information
        this.numTracks = this.data[0x30];
    }

    getTrackData(numTrack, buffer, bufferPos, size) {
        // Gets a pointer to the track's starting address
        const start = this.getTrackOffset(numTrack);

        // Get track information
        const sectorSize = this.data[start + 0x14] * 256;
        const numSectors = this.data[start + 0x15];

        // Check the length of the data to be copied
        const trackSize = numSectors * sectorSize;
        size = Math.min(trackSize, size);

        if (bufferPos + size > buffer.length) {
            throw new Error("Insufficient buffer capacity");
        }

        // Copy all sectors for this track
        buffer.set(this.data.slice(start + 0x100, start + 0x100 + size), bufferPos);
    }

    getTrackOffset(numTrack) {
        if (numTrack < 0 || numTrack >= this.numTracks) {
            throw new Error("Invalid track number: " + numTrack);
        }

        let offset = 0x00000100;
        for (let i = 0; i < numTrack; i++) {
            offset += this.data[0x34 + i] * 256;
        }

        return offset;
    }
}

module.exports = DiskReader;