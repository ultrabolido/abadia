const fs = require('fs');
const DiskImageLoader = require('./utils/DiskImageLoader.js');
const GfxGenerator = require('./generators/GfxGenerator.js');
const RoomGenerator = require('./generators/RoomGenerator.js');
const ScriptGenerator = require('./generators/ScriptGenerator.js');
const TextGenerator = require('./generators/TextGenerator.js');

const DISK_IMAGE_PATH = './public/assets/disk/abadia.dsk';
const GFX_OUTPT_PATH = './public/assets/gfx/';
const TXT_OUTPT_PATH = './public/assets/txt/';
const ROOMS_OUTPUT_PATH = './public/assets/abadia/';
const SCRIPTS_OUTPUT_PATH = './public/assets/abadia/scripts.abs';

async function main() {
    const diskImageData = fs.readFileSync(DISK_IMAGE_PATH);
    const memoryData = DiskImageLoader.readDiskImageToMemory(diskImageData);

    const gfxGenerator = new GfxGenerator(memoryData);
    gfxGenerator.generateAllTileSet(GFX_OUTPT_PATH);
    gfxGenerator.generateAllSpriteSet(GFX_OUTPT_PATH);
    gfxGenerator.generateUiSet(GFX_OUTPT_PATH);

    const textGenerator = new TextGenerator(memoryData);
    textGenerator.generateText(TXT_OUTPT_PATH);
    textGenerator.generateScrollChars(TXT_OUTPT_PATH);
    textGenerator.generateScrollsText(TXT_OUTPT_PATH);

    const roomGenerator = new RoomGenerator(memoryData);
    roomGenerator.generateRooms(ROOMS_OUTPUT_PATH);
    roomGenerator.generateFloors(ROOMS_OUTPUT_PATH);

    const scriptGenerator = new ScriptGenerator(memoryData);
    scriptGenerator.generateScripts(SCRIPTS_OUTPUT_PATH);
}

main().catch(console.error);