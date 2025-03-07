const fs = require('fs');
const { BANK_ABADIA_8, BANK_ABADIA_7, BASE_ADDRESS_SCREEN_DATA, BASE_ADDRESS_HEIGHT_DATA } = require('../constants');
const { FLOORS } = require('../data/floors');

class RoomGenerator {

    static FLOOR_OFFSET = [ 0x000, 0x500, 0x680 ];
    static BLOCK_INCREMENT = [ [1, 0], [0, -1], [-1, 0], [0, 1]];

    constructor(memoryData) {
        this.memoryData = memoryData;
    }

    generateFloors(outputPath) {
        this.saveToFile(FLOORS, outputPath + "floors.json");
    }

    generateRooms(outputPath) {
        let offset = BASE_ADDRESS_SCREEN_DATA;
        const rooms = [];

        for (let i = 0; i <= 115; i++) {
            const room = this.generateRoom(i, offset + 1);
            rooms.push(room);
            offset = this.getByte(BANK_ABADIA_8, offset) + offset;
        }

        // Init height data
        rooms.forEach( room => {

            if (room.blocks.length == 0) return;

            room.heightData = Array.from({ length: 16 }, () => Array(16).fill(0));
        });

        RoomGenerator.FLOOR_OFFSET.forEach ( (offset, index) => {

            const heightData = this.createHeightData(offset);
            this.addHeightToRooms(index, rooms, heightData);

        });

        this.saveToFile(rooms, outputPath + "rooms.json");

    }

    generateRoom(id, offset) {
        const room = { id, blocks: [] };
        
        while (this.getByte(BANK_ABADIA_8, offset) != 0xFF) {
            const block = this.generateBlock(offset);
            room.blocks.push(block);
            offset += block.height !== 0xFF ? 4 : 3;
        }

        return room;
    }

    generateBlock(offset) {
        const type = this.getByte(BANK_ABADIA_8, offset);
        const x = this.getByte(BANK_ABADIA_8, offset + 1);
        const y = this.getByte(BANK_ABADIA_8, offset + 2);
        const height = this.getByte(BANK_ABADIA_8, offset + 3);
        return {
            type: type & 0xFE,
            x: x & 0x1F,
            y: y & 0x1F,
            param1: (x >> 5) & 0x07,
            param2: (y >> 5) & 0x07,
            height: (type & 0x01) === 0 ? 0xFF : height
        };
    }

    createHeightData(offset) {

        offset += BASE_ADDRESS_HEIGHT_DATA;

        const blocks = [];

        while (this.getByte(BANK_ABADIA_7, offset) != 0xFF) {
            
            const block = {
                type: this.getByte(BANK_ABADIA_7, offset + 0),
                x: this.getByte(BANK_ABADIA_7, offset + 1),
                y: this.getByte(BANK_ABADIA_7, offset + 2),
                width: this.getByte(BANK_ABADIA_7, offset + 3),
                height: this.getByte(BANK_ABADIA_7, offset + 4)
            }

            offset += 5;

            if ((block.type & 0x08) == 0) {
                block.height = block.width & 0x0F;
                block.width = (block.width >> 4) & 0x0F;
                offset--;
            }

            block.height++;
            block.width++;

            blocks.push(block);
        }

        return blocks;

    }

    addHeightToRooms(floor, rooms, heightData) {
        
        heightData.forEach (block => {

            let height = block.type >> 4;

            for (let x = 0; x < block.width; x++) {

                let oldHeight = height;

                for (let y = 0; y < block.height; y++) {

                    const roomX = (block.x + x) >> 4;
                    const roomY = (block.y + y) >> 4;
                    const roomId = FLOORS[floor].room[roomY][roomX];
                    
                    if ((roomId == 0) || (!rooms[roomId - 1].heightData)) continue;

                    const posX = (block.x + x) & 0xF;
                    const posY = (block.y + y) & 0xF;

                    rooms[roomId - 1].heightData[posY][posX] = height;

                    if ((block.type & 0x07) != 5) height += RoomGenerator.BLOCK_INCREMENT[(block.type & 0x07) - 1][1];

                }

                if ((block.type & 0x07) != 5) height = oldHeight + RoomGenerator.BLOCK_INCREMENT[(block.type & 0x07) - 1][0];
            }

        });
    
    }

    getByte(bank, offset) {
        return this.memoryData[bank + offset] & 0xff;
    }

    saveToFile(data, outputPath) {
        const jsonString = JSON.stringify(data, null, 2);
        fs.writeFileSync(outputPath, jsonString);
        console.log(`Abadia data saved to ${outputPath}`);
    }
}

module.exports = RoomGenerator;