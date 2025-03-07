class ScriptInterpreter {
  
  constructor(parsedScripts) {
    
    this.scripts = parsedScripts;
    this.tileBuffer = this.createEmptyTileBuffer();
    
  }

  createEmptyTileBuffer() {
    const buffer = [];
    for (let x = 0; x < 16; x++) {
      buffer[x] = [];
      for (let y = 0; y < 20; y++) {
        buffer[x][y] = [];
      }
    }
    return buffer;
  }

  executeBlock(block) {

    this.block = {...block, depthx: 0, depthy: 0};
    this.scriptId = 'SCRIPT' + (block.type >> 1);
    this.line = 0;
    this.flipX = false;
    this.stack = [];
    this.tiles = [];

    this.executeScript(true);
    
  }

  executeScript(modifyTiles) {
    if (modifyTiles) {
      this.tiles = this.scripts[this.scriptId].tiles;
    }

    if (this.block.height != 0xff) {
      
      this.block.depthx = (this.block.y + this.block.height / 2) + this.block.x - 15;
      this.block.depthy = (this.block.y + this.block.height / 2) - this.block.x + 16;
      
    }

    let end = false;
  
    while (!end) {
      
      const { opcode, params } = this.scripts[this.scriptId].lines[this.line];
      this.line++;
      switch (opcode) {
        case 'JMP':
          this.scriptId = params[0];
          this.line = params[1];
          break;
        case 'LD':
          let res = this.evalExpression(params[1]);
          
          let p = params[0];
          if (this.flipX && (params[0] == "DEPTHX")) p = "DEPTHY";
          if (this.flipX && (params[0] == "DEPTHY")) p = "DEPTHX";

          if ((p == "DEPTHX") && (this.block.depthx == 0)) break;
          if ((p == "DEPTHY") && (this.block.depthy == 0)) break;
          if (p.startsWith("DEPTH") && (res > 100)) res = 0;

          this.block[p.toLowerCase()] = res;
          break;
        case 'ADD':
          const addRes = this.evalExpression(params[1]);
          this.block[params[0].toLowerCase()] += addRes;
          break;
        case 'WHILE':
          this.whileHandler(this.block[params[0].toLowerCase()]);
          break;
        case 'ENDWHILE':
          this.endWhileHandler();
          break;
        case 'PUSH':
          this.stack.push(this.block[params[0].toLowerCase()]);
          break;
        case 'POP':
          this.block[params[0].toLowerCase()] = this.stack.pop();
          break;
        case 'DRAWTILE':
          this.drawTileHandler(params[0]);
          break;
        case 'DEC':
          let decOffset = 1;
          if ((params[0] == 'X') && this.flipX) decOffset = -1;
          this.block[params[0].toLowerCase()] -= decOffset;
          break;
        case 'INC':
          let incOffset = 1;
          if ((params[0] == 'X') && this.flipX) incOffset = -1;
          this.block[params[0].toLowerCase()] += incOffset;
          break;
        case 'END':
          end = true;
          if (modifyTiles) this.flipX = false;
          break;
        case 'CALL':
          this.callHandler(params[0], true);
          break;
        case 'CALLP':
          this.callHandler(params[0], false);
          break;
        case 'FLIP':
          this.flipX = !this.flipX;
          break;
        default:
          throw new Error(`Opcode ${opcode} NOT FOUND`);
      }
    }
  }

  endWhileHandler() {
    let v = this.stack.pop();
    v--;

    if ( v > 0 ) {
      this.scriptId = this.stack.pop();
      this.line = this.stack.pop();
    
      this.stack.push(this.line);
      this.stack.push(this.scriptId);
      this.stack.push(v);
    } else{
      this.stack.pop();
      this.stack.pop();
    }
  }

  whileHandler(v) {
    if (v > 0) {
      this.stack.push(this.line);
      this.stack.push(this.scriptId);
      this.stack.push(v);
    } else {
      let whileDepth = 1;

      while (whileDepth > 0) {
        const opcode = this.scripts[this.scriptId].lines[this.line].opcode;
        
        if (opcode == 'WHILE') whileDepth++;
        if (opcode == 'ENDWHILE') whileDepth--;
        this.line++;
      }
    }
  }

  drawTileHandler(tile) {
    
    if (tile.startsWith('T')) tile = this.tiles[tile.slice(1)];

    const pX = this.block.x - 8;
    const pY = this.block.y - 8;
    if (pX < 0 || pX >= 16) return;
    if (pY < 0 || pY >= 20) return;

    // update depth

    let dx = this.block.depthx;
    let dy = this.block.depthy;

    this.tileBuffer[pX][pY].push({
      tile: Number(tile) + 1,
      depthX: dx,
      depthY: dy
    });

    for (let i = this.tileBuffer[pX][pY].length - 2; i >= 0; i--) {

      const tOld = this.tileBuffer[pX][pY][i];
      const tNew = this.tileBuffer[pX][pY][i+1];
      
      if ((tOld.depthX + tOld.depthY ) > ( tNew.depthX + tNew.depthY)) {
        
        if (tOld.depthX > tNew.depthX) tOld.depthX = tNew.depthX;
        if (tOld.depthY > tNew.depthY) tOld.depthY = tNew.depthY;

      }

    }

  }

  evalExpression(exp) {
    if (this.flipX) {
      exp = exp.replaceAll('X', 'Z');
      exp = exp.replaceAll('Y', 'X');
      exp = exp.replaceAll('Z', 'Y');
    }

    ['DEPTHX','DEPTHY','PARAM1','PARAM2','HEIGHT'].forEach((r) => {
      exp = exp.replaceAll(r, this.block[r.toLowerCase()]);
    });
    
    return eval(exp);
  }

  callHandler(s, modifyTiles) {
    
    this.stack.push({...this.block});
    this.stack.push(this.flipX);
    this.stack.push(this.line);
    this.stack.push(this.scriptId);

    this.scriptId = s;
    this.line = 0;
    this.executeScript(modifyTiles);

    this.scriptId = this.stack.pop();
    this.line = this.stack.pop();
    this.flipX = this.stack.pop();
    this.block = this.stack.pop();
  }

  getTileBuffer() {
    return this.tileBuffer;
  }

  clearTileBuffer() {
    this.tileBuffer = this.createEmptyTileBuffer();
  }

}

export default ScriptInterpreter;