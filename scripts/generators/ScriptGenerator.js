const fs = require('fs');
const { BANK_ABADIA_1, BASE_ADDRESS_BLOCK_TABLE, BLOCK_SCRIPTS, BLOCK_REGISTER } = require('../constants');
const { TILES_PER_BLOCKTYPE } = require('../data/tilesPerBlockType');

class ScriptGenerator {
    constructor(memoryData) {
        this.memoryData = memoryData;
        this.scriptOffset = [];
        this.pc = 0;
    }

    generateScripts(outputPath) {
        this.initializeScriptOffsets();
        const scripts = this.generateAllScripts();
        this.processJumpScripts(scripts);
        this.saveScriptsToFile(scripts, outputPath);
    }

    initializeScriptOffsets() {
        for (let t = 1; t < BLOCK_SCRIPTS; t++) {
            this.scriptOffset[t] = this.getWord(BANK_ABADIA_1, BASE_ADDRESS_BLOCK_TABLE + (t << 1));
        }
        const routineOffset = [0x1d59, 0x18e7, 0x1f20, 0x1ca6, 0x1caf, 0x1f86, 0x1f80, 0x1891, 0x1875, 0x1def];
        const jumpOffset = [0x198c, 0x19ad, 0x19c6, 0x1990, 0x19a9, 0x19ca, 0x19d4, 0x1bcf];
        this.scriptOffset.push(...routineOffset, ...jumpOffset);
    }

    generateAllScripts() {
        const scripts = [];
        for (let t = 1; t < this.scriptOffset.length; t++) {
            try {
                const script = this.generateScript(this.scriptOffset[t], t, t < this.scriptOffset.length - 8);
                scripts.push(script);
            } catch (error) {
                console.error(`Error generating script ${t}:`, error);
            }
        }
        
        return scripts;
    }

    generateScript(offset, index, hasTiles) {
        const script = {
            tiles: [],
            lines: [],
            id: `SCRIPT${index}`
        };

        if (hasTiles) {
            const tileOffset = this.getWord(BANK_ABADIA_1, offset);
            const n = TILES_PER_BLOCKTYPE[tileOffset.toString(16)];
            script.tiles = this.memoryData.slice(BANK_ABADIA_1 + tileOffset, BANK_ABADIA_1 + tileOffset + n);
            offset += 2;
        }

        this.pc = offset;
        while (true) {
            const line = this.generateScriptLine();
            script.lines.push(line);
            if (line.instructions.some(i => i === 'END' || i.startsWith('JMP '))) break;
        }

        return script;
    }

    generateScriptLine() {
        const line = {
            address: this.pc,
            instructions: []
        };

        const opcode = this.getByte(BANK_ABADIA_1, this.pc++);
        this.processOpcode(opcode, line);

        return line;
    }

    processOpcode(opcode, line) {
        const opcodeHandlers = {
            0xF9: () => this.drawTile("DEC Y", line),
            0xF8: () => this.drawTile("INC X", line),
            0xEA: () => {
                const o = this.getWord(BANK_ABADIA_1, this.pc);
                line.instructions.push(`JMP ${o}`);
                return true;
            },
            0xF2: () => line.instructions.push(`ADD Y, ${this.parseExpression()}`),
            0xF1: () => line.instructions.push(`ADD X, ${this.parseExpression()}`),
            0xEC: () => this.handleCall(line, "CALL"),
            0xE4: () => this.handleCall(line, "CALLP"),
            0xE9: () => line.instructions.push("FLIP X"),
            0xFF: () => {
                line.instructions.push("END");
                return true;
            },
            0xF7: () => {
                const data = this.getByte(BANK_ABADIA_1, this.pc++);
                const exp = this.parseExpression();
                line.instructions.push(`LD ${this.getBlockRegister(data)}, ${exp}`);
            },
            0xF0: () => line.instructions.push("INC PARAM1"),
            0xEF: () => line.instructions.push("INC PARAM2"),
            0xEE: () => line.instructions.push("DEC PARAM1"),
            0xED: () => line.instructions.push("DEC PARAM2"),
            0xFE: () => line.instructions.push("WHILE PARAM1"),
            0xFD: () => line.instructions.push("WHILE PARAM2"),
            0xFC: () => {
                line.instructions.push("PUSH X");
                line.instructions.push("PUSH Y");
            },
            0xFB: () => {
                line.instructions.push("POP Y");
                line.instructions.push("POP X");
            },
            0xF3: () => line.instructions.push("DEC X"),
            0xF4: () => line.instructions.push("DEC Y"),
            0xF6: () => line.instructions.push("INC Y"),
            0xF5: () => line.instructions.push("INC X"),
            0xFA: () => line.instructions.push("ENDWHILE")
        };

        if (opcodeHandlers[opcode]) {
            return opcodeHandlers[opcode]();
        } else {
            throw new Error(`Opcode ${opcode.toString(16)} NOT FOUND`);
        }
    }

    handleCall(line, callType) {
        const c = this.getWord(BANK_ABADIA_1, this.pc);
        this.pc += 2;
        const bt = this.scriptOffset.indexOf(c);
        if (bt === -1) {
            console.log(`${callType} script 0x${c.toString(16)} not found!`);
        } else {
            line.instructions.push(`${callType} SCRIPT${bt}`);
        }
    }

    parseExpression() {
        let exp = this.getDataOrRegister(true);
        let opcode;
        while ((opcode = this.getByte(BANK_ABADIA_1, this.pc)) < 0xC8) {
            if (opcode === 0x84) {
                exp = `-( ${exp} )`;
                this.pc++;
            } else {
                exp += ` + ${this.getDataOrRegister(true)}`;
            }
        }
        return exp;
    }

    getDataOrRegister(signed) {
        const data = this.getByte(BANK_ABADIA_1, this.pc++);
        if (data <= 0x60) return data.toString();
        if (data === 0x82) {
            let value = this.getByte(BANK_ABADIA_1, this.pc++);
            if (signed && (value > 127)) value -= 256;
            return value.toString();
        }
        if (data >= 0x6D) return this.getBlockRegister(data);
        return `T${data - 0x61}`;
    }

    getBlockRegister(data) {
        return BLOCK_REGISTER[data - 0x6D];
    }

    drawTile(nextOpcode, line) {
        while (true) {
            const num = this.getDataOrRegister(false);
            let d = this.getByte(BANK_ABADIA_1, this.pc);
            if (d >= 0xC8) {
                line.instructions.push(`DRAWTILE ${num}`);
                line.instructions.push(`${nextOpcode}`);
                break;
            }
            this.pc++;
            if (d === 0x80) {
                line.instructions.push(`DRAWTILE ${num}`);
                line.instructions.push(`${nextOpcode}`);
            } else if (d === 0x81) {
                line.instructions.push(`DRAWTILE ${num}`);
            } else {
                const n = this.getByte(BANK_ABADIA_1, this.pc++);
                for (let j = 0; j < n; j++) {
                    line.instructions.push(`DRAWTILE ${num}`);
                    line.instructions.push(`${nextOpcode}`);
                }
                d = this.getByte(BANK_ABADIA_1, this.pc);
                if (d >= 0xC8) break;
                this.pc++;
            }
        }
    }

    processJumpScripts(scripts) {
        scripts.forEach(script => {
            script.lines.forEach(line => {
                line.instructions = line.instructions.map(ins => {
                    const [op, addr] = ins.split(' ');
                    if (op === 'JMP') {
                        const res = this.searchScript(scripts, addr);
                        return res ? `JMP ${res.id}, ${res.line}` : ins;
                    }
                    return ins;
                });
            });
        });
    }

    searchScript(scripts, addr) {
        for (let t = 0; t < scripts.length; t++) {
            const script = scripts[t];
            let line = 0;
            for (let i = 0; i < script.lines.length; i++) {
                if (script.lines[i].address == addr) {
                    //const l = script.tiles.length === 0 ? i : i + 1;
                    return { id: script.id, line: line };
                }
                line += script.lines[i].instructions.length;
            }
        }
        console.log(`JUMP script 0x${addr} not found!`);
        return null;
    }

    saveScriptsToFile(scripts, outputPath) {
        const scriptFile = scripts.map(this.printScript).join('\n');
        fs.writeFileSync(outputPath, scriptFile.trimEnd());
        console.log(`Scripts saved to ${outputPath}`);
    }

    printScript(script) {
        let bufferScript = `[${script.id}]\n`;
        if (script.tiles.length > 0) {
            bufferScript += `TILES ${script.tiles.join(',')}\n`;
        }
        script.lines.forEach(line => {
            line.instructions.forEach(instruction => {
                bufferScript += `${instruction}\n`;
            });
        });
        return bufferScript;
    }

    getWord(bank, offset) {
        return this.memoryData[bank + offset] & 0xff | ((this.memoryData[bank + offset + 1] & 0xFF) << 8);
    }

    getByte(bank, offset) {
        return this.memoryData[bank + offset] & 0xff;
    }
}

module.exports = ScriptGenerator;