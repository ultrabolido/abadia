const fs = require('fs');
const { BANK_ABADIA_3, BANK_ABADIA_2, BANK_ABADIA_8 } = require('../constants');
const { BASE_ADDRESS_WORD_TABLE, BASE_ADDRESS_PHRASE_TABLE, BASE_ADDRESS_SCROLL_CHAR_TABLE, BASE_ADDRESS_BEGIN_SCROLL_TEXT, BASE_ADDRESS_END_SCROLL_TEXT } = require('../constants');

class TextGenerator {
    constructor(memoryData) {
        this.memoryData = memoryData;
        this.words = this.readWords();
    }

    generateScrollsText(outputPath) {

        const beginScroll = this.generateScrollText(BANK_ABADIA_2, BASE_ADDRESS_BEGIN_SCROLL_TEXT);
        const endScroll = this.generateScrollText(BANK_ABADIA_8, BASE_ADDRESS_END_SCROLL_TEXT);

        this.saveToFile({ beginScroll, endScroll}, outputPath + "scrollText.json");
    }

    generateScrollText(bank, offset) {

        const pages = [];
        let lines = [];
        let line = "";
        let end = false;

        while (!end) {

            const char = this.getByte(bank, offset++);

            switch (char) {

                case 0x1A: 
                    end = true;
                    pages.push(lines);
                    break;
                case 0x0D: 
                    lines.push(line);
                    line = "";
                    break;
                case 0x0A:
                    pages.push(lines);
                    lines = [];
                    break;
                default:
                    line += String.fromCharCode(char);
                    break;

            }

            if (lines.length == 10) {
                pages.push(lines);
                lines = [];
            }
        }

        return pages;
        
    }

    generateScrollChars(outputPath) {
        let offset = BASE_ADDRESS_SCROLL_CHAR_TABLE;
        const scrollChars = new Map();

        for (let i = 0; i < 0x5D; i++) {
            const data = this.getWord(BANK_ABADIA_2, offset + (i << 1));
            
            if ( data != 0) {

                let charOffset = data - 0x4000;
                let end = false;
                let char = {
                    width: 0,
                    pixels: []
                };

                while (!end) {
                    const pos = this.getByte(BANK_ABADIA_2, charOffset++);

                    if (( pos & 0xF0) == 0xF0 ) {
                        end = true;
                        char.width = pos & 0x0F;
                    } else {
                        char.pixels.push({
                            x: pos & 0x0F,
                            y: (pos >> 4) & 0x0F
                        })
                    }

                }
                const key = String.fromCharCode(i + 0x20);
                scrollChars.set(key, char);

            }
        }

        this.saveToFile(Array.from(scrollChars.entries()), outputPath + "scrollChars.json");
    }

    generateText(outputPath) {
        
        let offset = BASE_ADDRESS_PHRASE_TABLE;
        let phrases = [];

        for (let i=0; i < 0x38; i++) {

            let phrase = "";
            let end = false;

            while ( !end ) {

                const word = this.getByte(BANK_ABADIA_3, offset++);

                if (( word > 0xF8) && ( word != 0xFA )) phrase = phrase.slice(0,-1);

                switch (word) {
                    case 0xFF: end = true; break;
                    case 0xF9: break;
                    case 0xFE: phrase += ","; break;
                    case 0xFD: phrase += "."; break;
                    case 0xFA: phrase += "¿"; break;
                    case 0xFB: phrase += "?"; break;
                    case 0xFC: phrase += ";"; break;
                    default: phrase += this.words[word];
                }

                if (( word != 0xFF ) && ( word != 0xFA ) && ( word != 0xF9 )) phrase += " ";

            }
            
            phrases.push(phrase.replace('W', 'Ñ'));

        }

        this.saveToFile(phrases, outputPath + "phrases.json");
    }

    readWords() {

        let offset = BASE_ADDRESS_WORD_TABLE;
        const words = [];

        for (let i=0; i < 0xEF; i++) {

            let end = false;
            let word = "";

            while (!end) {
                const char = this.getByte(BANK_ABADIA_3, offset++);
                word += String.fromCharCode(char & 0x7F);
                if ((char & 0x80) != 0) end = true;
            }

            words.push(word);

        }

        return words;
        
    }

    getByte(bank, offset) {
        return this.memoryData[bank + offset] & 0xff;
    }

    getWord(bank, offset) {
        return this.memoryData[bank + offset] & 0xff | ((this.memoryData[bank + offset + 1] & 0xFF) << 8);
    }

    saveToFile(obj, outputPath) {
        const jsonString = JSON.stringify(obj, null, 2);
        fs.writeFileSync(outputPath, jsonString);
        console.log(`Text saved to ${outputPath}`);
    }
}

module.exports = TextGenerator;