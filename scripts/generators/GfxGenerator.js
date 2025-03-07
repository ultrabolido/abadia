const fs = require('fs');
const { PNG } = require('pngjs');
const { BANK_ABADIA_0, BANK_ABADIA_3, BANK_ABADIA_8 } = require('../constants');
const { BASE_ADDRESS_UI_GFX, BASE_ADDRESS_TILES_GFX, BASE_ADDRESS_SPRITES_GFX, BASE_ADDRESS_CHARSET_GFX } = require('../constants');
const { DAY_PALETTE, NIGHT_PALETTE, TITLE_SCREEN_PALETTE, SCROLL_PALETTE } = require('../constants');

class GfxGenerator {

    static PALETTE = {
        DAY: "day",
        NIGHT: "night"
    }

    constructor(memoryData) {
        this.memoryData = memoryData;
    }

    generateUiSet(outputPath) {
        const uiSetOutputPath = outputPath + "ui/";
        const uiSetConfigs = [{ 
            name: 'hud', 
            sprites: this.getHUDSprite(), 
            maxSize: { width: 256, height: 32 }, 
            baseAddress: BASE_ADDRESS_UI_GFX, 
            bank: BANK_ABADIA_8, 
            flip: false,
            transparent: -1 },{
            name: 'days',
            sprites: this.getDaysSprite(),
            maxSize: { width: 8, height: 8 },
            flip: false,
            transparent: -1
            }
        ];

        uiSetConfigs.forEach(config => this.generateSpriteSet(config, uiSetOutputPath, GfxGenerator.PALETTE.DAY));
        uiSetConfigs.forEach(config => this.generateSpriteSet(config, uiSetOutputPath, GfxGenerator.PALETTE.NIGHT));
        this.generateCharset(uiSetOutputPath, GfxGenerator.PALETTE.DAY);
        this.generateTitleScreen(uiSetOutputPath);
        this.generateScrollScreen(uiSetOutputPath);
    }

    generateScrollScreen(outputPath) {
        const width = 320;
        const height = 200;
        const colorType = 2;
        const bgColor = { red: SCROLL_PALETTE[1][0], green: SCROLL_PALETTE[1][1], blue: SCROLL_PALETTE[1][2] };
        const screen = new PNG({ width, height, bgColor, colorType });

        this.drawHScroll(screen, 0, 0x3a00);
        this.drawVScroll(screen, 248, 0x3a00 + 0x180);
        this.drawVScroll(screen, 64, 0x3a00 + 0x180 * 2);
        this.drawHScroll(screen, 184, 0x3a00 + 0x180 * 3);
        this.fill(screen, 72, 8, 176, 176, SCROLL_PALETTE[0]);
        
        this.savePNG(screen, outputPath + "scroll.png");
        console.log(`Generated Scroll Screen ${outputPath}`);
    }

    fill(screen, x, y, width, height, color) {

        for (let i=0; i < width; i++) {
            for (let j=0; j < height; j++) {
                const idx = screen.width * (j + y) + x + i;
                screen.data.set(color, idx << 2);
            }
        }
    }

    drawHScroll(screen, y, offset) {
        
        for (let i = 0; i < 192 / 4; i++) {
            
            for (let j = 0; j < 8; j++) {
                
                const data = this.getByte(BANK_ABADIA_8, offset++);
                
                for (let k = 0; k < 4; k++) {

                    const color = this.unpackPixelMode1(data, k)
                    const idx = screen.width * (j + y) + 64 + (i * 4) + k
                    screen.data.set(SCROLL_PALETTE[color], idx << 2);

                }
                
            }
        }
    }

    drawVScroll(screen, x, offset) {
        
        for (let j = 0; j < 192; j++) {
            
            for (let i = 0; i < 2; i++) {

                const data = this.getByte(BANK_ABADIA_8, offset++);
                
                for (let k = 0; k < 4; k++) {

                    const color = this.unpackPixelMode1(data, k)
                    const idx = screen.width * j + x + (i * 4) + k;
                    screen.data.set(SCROLL_PALETTE[color], idx << 2);
                    
                }
                
            }
        }
    }

    generateTitleScreen(outputPath) {
        const width = 320;
        const height = 200;
        const screen = new PNG({ width, height });

        for (let y=0; y < 200; y++) {
            
            let offset = (y & 0x07) * 0x800 + (y >> 3) * 80;

            for (let x=0; x < 80; x++) {
                
                const data = this.getByte(BANK_ABADIA_0, offset++);

                for (let k=0; k < 2; k++) {

                    const color = this.unpackPixelMode0(data, k);
                    const idx = screen.width * y + (x << 2) + (k << 1);
                    screen.data.set(TITLE_SCREEN_PALETTE[color], idx << 2);
                    screen.data.set(TITLE_SCREEN_PALETTE[color], (idx + 1) << 2);
                }

            }
        }

        this.savePNG(screen, outputPath + "title.png");
        console.log(`Generated Title Screen ${outputPath}`);
    }

    generateCharset(outputPath) {
        const width = 8 * 10;
        const height = 8 * 5;
        const charset = new PNG({ width, height });

        for (let num = 0; num < 46; num++) {
            this.generateChar(charset, num);
        }

        this.savePNG(charset, outputPath + "charset.png");
        console.log(`Generated Charset ${outputPath}`);
    }

    generateChar(charset, num) {
        
        let charData = BASE_ADDRESS_CHARSET_GFX + num * 8;
        const offsetX = (num % 10) * 8;
        const offsetY = Math.floor(num / 10) * 8;

        for (let j = 0; j < 8; j++) {

            let bit = 0x80;
            const data = this.getByte(BANK_ABADIA_3, charData);

            for (let i = 0; i < 8; i++) {
                
                if ( bit & data ) {
                    const idx = (charset.width * (offsetY + j) + offsetX + i) << 2;
                    charset.data.set([0xFF, 0xFF, 0xFF, 0xFF], idx);
                }
                bit = bit >> 1;
            }
            charData++;
        }
    }

    generateAllSpriteSet(outputPath) {
        const spritesOutputPath = outputPath + "sprites/";
        const spriteConfigs = [
            { name: 'guillermo', sprites: this.getGuillermoSprites(), maxSize: { width: 20, height: 36 } },
            { name: 'adso', sprites: this.getAdsoSprites(), maxSize: { width: 20, height: 32 } },
            { name: 'doors', sprites: this.getDoorSprites(), maxSize: { width: 24, height: 40 } },
            { name: 'objects', sprites: this.getObjectSprites(), maxSize: { width: 16, height: 12 }, baseAddress: BASE_ADDRESS_TILES_GFX, flip: false }
        ];

        const monkCharacters = [
            'severino', 'abad', 'malaquias', 'berengario', 'bernardo', 'jorge', 'hooded'
        ];

        // Generate main character and object sprites
        spriteConfigs.forEach(config => this.generateSpriteSet(config, spritesOutputPath, GfxGenerator.PALETTE.DAY));
        spriteConfigs.forEach(config => this.generateSpriteSet(config, spritesOutputPath, GfxGenerator.PALETTE.NIGHT));

        // Generate monk character sprites
        const monkSprites = this.getMonkSprites();
        monkCharacters.forEach((name, index) => {
            const monkConfig = {
                name,
                sprites: monkSprites,
                maxSize: { width: 20, height: 36 },
                headOffset: 0xE03 + (index * 0x64)
            };
            this.generateSpriteSet(monkConfig, spritesOutputPath, GfxGenerator.PALETTE.DAY);
            this.generateSpriteSet(monkConfig, spritesOutputPath, GfxGenerator.PALETTE.NIGHT);
        });
    }

    generateSpriteSet(config, outputPath, paletteType) {
        const { name, 
                sprites, 
                maxSize, 
                baseAddress = BASE_ADDRESS_SPRITES_GFX, 
                bank = BANK_ABADIA_3, 
                headOffset = 0, 
                flip = true, 
                transparent = 0 } = config;

        const spriteSet = new PNG({ width: maxSize.width * sprites.length, height: (flip ? maxSize.height * 2 : maxSize.height) });

        sprites.forEach((sprite, index) => {
            this.generateSprite(spriteSet, {
                ...sprite,
                index,
                maxWidth: maxSize.width,
                maxHeight: maxSize.height,
                headOffset,
                baseAddress,
                bank,
                flip,
                transparent
            }, paletteType);
        });

        this.savePNG(spriteSet, outputPath + name + "_" + paletteType + ".png");
        console.log(`Generated Spriteset ${name} ${outputPath}`);
    }

    generateSprite(spriteSet, spriteConfig, paletteType) {
        const { spriteOffset, index, width, height, maxWidth, maxHeight, headOffset, baseAddress, bank, flip, transparent } = spriteConfig;
        const palette = (paletteType == GfxGenerator.PALETTE.NIGHT) ? NIGHT_PALETTE : DAY_PALETTE;

        let spriteData = baseAddress + (headOffset ? headOffset : spriteOffset);
        if (headOffset) spriteData += (index > 3) ? 0x32 : 0;

        const offset = index * maxWidth;

        for (let j = 0; j < height; j++) {
            if (headOffset && (j == 10)) spriteData = baseAddress + spriteOffset;

            for (let i = 0; i < (width >> 2); i++) {
                const data = this.getByte(bank, spriteData);
                this.drawGfxRow(spriteSet, data, offset + i * 4, j, transparent, false, palette);
                if (flip) this.drawGfxRow(spriteSet, data, offset + (width - 1) - (i * 4), j + maxHeight, transparent, true, palette);
                spriteData++;
            }
        }
    }

    getHUDSprite() {
        return [
            { spriteOffset: 0, width: 256, height: 32}
        ];
    }

    getDaysSprite() {
        return [
            { spriteOffset: 0x839, width: 8, height: 8},
            { spriteOffset: 0x849, width: 8, height: 8}
        ];
    }

    getGuillermoSprites() {
        return [
            { spriteOffset: 0x0B4, width: 20, height: 34 },
            { spriteOffset: 0x000, width: 20, height: 36 },
            { spriteOffset: 0x0B4, width: 20, height: 34 },
            { spriteOffset: 0x15E, width: 20, height: 34 },
            { spriteOffset: 0x366, width: 16, height: 33 },
            { spriteOffset: 0x208, width: 20, height: 35 },
            { spriteOffset: 0x366, width: 16, height: 33 },
            { spriteOffset: 0x2B7, width: 20, height: 33 }
        ];
    }

    getAdsoSprites() {
        return [
            { spriteOffset: 0x48A, width: 20, height: 32 },
            { spriteOffset: 0x3EA, width: 20, height: 32 },
            { spriteOffset: 0x48A, width: 20, height: 32 },
            { spriteOffset: 0x52A, width: 20, height: 31 },
            { spriteOffset: 0x5C5, width: 16, height: 30 },
            { spriteOffset: 0x63D, width: 16, height: 30 },
            { spriteOffset: 0x5C5, width: 16, height: 30 },
            { spriteOffset: 0x6B5, width: 16, height: 30 }
        ];
    }

    getDoorSprites() {
        return [
            { spriteOffset: 0x749, width: 24, height: 40 }
        ];
    }

    getMonkSprites() {
        return [
            { spriteOffset: 0x859 + 0x082, width: 20, height: 34 },
            { spriteOffset: 0x859 + 0x000, width: 20, height: 36 },
            { spriteOffset: 0x859 + 0x082, width: 20, height: 34 },
            { spriteOffset: 0x859 + 0x0FA, width: 20, height: 34 },
            { spriteOffset: 0x859 + 0x262, width: 20, height: 33 },
            { spriteOffset: 0x859 + 0x172, width: 20, height: 35 },
            { spriteOffset: 0x859 + 0x262, width: 20, height: 33 },
            { spriteOffset: 0x859 + 0x1EF, width: 20, height: 33 }
        ];
    }

    getObjectSprites() {
        return [
            { spriteOffset: 0x05F0, width: 16, height: 12 },
            { spriteOffset: 0x1CB0, width: 16, height: 12 },
            { spriteOffset: 0x1C80, width: 16, height: 12 },
            { spriteOffset: 0x1D10, width: 16, height: 12 },
            { spriteOffset: 0x1CE0, width: 16, height: 12 },
            { spriteOffset: 0x1CE0, width: 16, height: 12 },
            { spriteOffset: 0x1CE0, width: 16, height: 12 },
            { spriteOffset: 0x05C0, width: 16, height: 12 }
        ];
    }

    generateAllTileSet(outputPath) {

        this.generateTileSet(outputPath, GfxGenerator.PALETTE.DAY);
        this.generateTileSet(outputPath, GfxGenerator.PALETTE.NIGHT);
    }

    generateTileSet(outputPath, paletteType) {
        const width = 256;
        const height = 128;
        const tileset = new PNG({ width, height });

        for (let num = 0; num < 0x100; num++) {
            this.generateTile(tileset, num, paletteType);
        }

        this.savePNG(tileset, outputPath + "tiles/tiles_" + paletteType + ".png");
        console.log(`Generated Tileset ${outputPath}`);
    }

    generateTile(tileset, num, paletteType) {
        let tileData = BASE_ADDRESS_TILES_GFX + num * 32;
        const palette = (paletteType == GfxGenerator.PALETTE.NIGHT) ? NIGHT_PALETTE : DAY_PALETTE;
        const offsetX = (num % 16) * 16;
        const offsetY = Math.floor(num / 16) * 8;

        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < 4; i++) {
                const data = this.getByte(BANK_ABADIA_3, tileData);
                this.drawGfxRow(tileset, data, offsetX + i * 4, offsetY + j, num >= 0x80 ? 1 : 2, false, palette);
                tileData++;
            }
        }
    }

    drawGfxRow(png, data, x, y, transparent, flip, palette) {
        for (let k = 0; k < 4; k++) {
            let color = this.unpackPixelMode1(data, k);
            
            if (color != transparent) {
                const idx = (png.width * y + x + (flip ? -k : k)) << 2;
                png.data.set(palette[color], idx);
            }
        }
    }

    getByte(bank, offset) {
        return this.memoryData[bank + offset] & 0xff;
    }

    unpackPixelMode1(data, pixel) {
        return (((data >> (3 - pixel)) & 0x01) << 1) | ((data >> (7 - pixel)) & 0x01);
    }

    unpackPixelMode0(data, pixel) {
        return  (((data >> (1 - pixel)) & 0x01) << 3) |
                (((data >> (5 - pixel)) & 0x01) << 2) |
                (((data >> (3 - pixel)) & 0x01) << 1) |
                (((data >> (7 - pixel)) & 0x01) << 0);
    }

    savePNG(png, outputPath) {
        
        png.pack().pipe(fs.createWriteStream(outputPath))
               
    }
}

module.exports = GfxGenerator;