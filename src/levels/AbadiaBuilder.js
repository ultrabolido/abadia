import ScriptInterpreter from './ScriptInterpreter';
import { TILE_HACKS, MIRROR_HACKS, SCREEN_OFFSET_X, BACKGROUND_COLOR_DAY, BACKGROUND_COLOR_NIGHT } from '../constants';

class AbadiaBuilder {
  
  static MIRROR_ROOM = 115;
  static MIRROR_BLOCK = 12;

  static DOOR_CONNECTIONS = [
    [ { x: 5, y:  3, v: 1}, { x: 6, y:  3, v: 4 } ], // abad cell
    [ { x: 11, y: 1, v: 8}, { x: 11, y: 2, v: 2 } ], // monks cell
    [ { x: 6, y:  5, v: 8}, { x: 6, y:  6, v: 2 } ], // severino cell
    [ { x: 9, y:  2, v: 1}, { x: 10, y: 2, v: 4 } ], // chruch - cells
    [ { x: 7, y:  2, v: 1}, { x: 8, y:  2, v: 4 } ], // passage
    [ { x: 5, y:  7, v: 1}, { x: 6, y:  7, v: 4 } ]  // big door
  ];

  constructor(scene) {

    this.scene = scene;
    const scripts = this.scene.registry.get('parsedScripts');
    this.scriptInterpreter = new ScriptInterpreter(scripts);
    this.floors = this.scene.cache.json.get('floors');
    this.rooms = this.scene.cache.json.get('rooms');
    this.interpretedRooms = new Map();
    this.currentRoomSprites = [];
    this.debugMode = false;
    this.roomX;
    this.roomY;
    this.floor;
    this.tilePainted = new Array(320).fill(false);

    this.trapOpened = false;

    // fix height data for bench in room 77
    this.rooms[77].heightData[6][7] = 14;
    this.rooms[77].heightData[6][8] = 14;
    this.rooms[77].heightData[5][7] = 14;
    this.rooms[77].heightData[5][8] = 14;
    this.rooms[77].heightData[4][7] = 14;
    this.rooms[77].heightData[4][8] = 14;
    this.rooms[77].heightData[3][7] = 14;
    this.rooms[77].heightData[3][8] = 14;
    this.rooms[77].heightData[7][7] = 14;
    this.rooms[77].heightData[7][8] = 14;

    // fix closed connection
    this.floors[0].connections[2][8] = 0x08;
    this.floors[0].connections[2][7] = 0x0a;

    // Monks cell wall / door
    this.monksCellWall = [
      [ 15, 15, 15, 15, 15, 2, 2, 15, 15, 15, 15, 15, 15, 15],
      [ 15, 15, 15, 15, 15, 2, 2, 15, 15, 15, 15, 15, 15, 15],
      [ 15, 15, 15, 15, 15, 2, 2, 15, 15, 15, 15, 15, 15, 15],
      [ 15, 15, 15, 15, 15, 2, 2, 15, 15, 15, 15, 15, 15, 15],
      [ 15, 15, 15, 15, 15, 2, 2, 15, 15, 15, 15, 15, 15, 15]
    ];

    this.closeMirror();

  }

  clearDoorHeight() {
    this.scene.doors.forEach( door => {
      if (!door.isOpen) door.updateDoorHeight(door.height);
    });
  }

  resetDoorHeight() {
    this.scene.doors.forEach( door => {
      if (!door.isOpen) door.updateDoorHeight(0xF);
    });
  }

  openDoorPath(door) {
        
    for (let i = 0; i < 2; i++) {
        const data = AbadiaBuilder.DOOR_CONNECTIONS[door][i];
        this.floors[0].connections[data.y][data.x] = ~(data.v) & this.floors[0].connections[data.y][data.x];
    }
    
  }

  closeDoorPath(door) {
      
    for (let i = 0; i < 2; i++) {
      const data = AbadiaBuilder.DOOR_CONNECTIONS[door][i];
      this.floors[0].connections[data.y][data.x] = data.v | this.floors[0].connections[data.y][data.x];
    }
      
  }

  reBuildRoom() {

    this.buildRoom(this.floor, this.roomX, this.roomY);

  }

  buildRoom(floor, roomX, roomY) {

    this.roomX = roomX;
    this.roomY = roomY;
    this.floor = floor;

    this.clearCurrentRoom();

    const num = this.floors[floor].room[roomY][roomX];

    let roomData;
    if (this.interpretedRooms.has(num)) {
      roomData = this.interpretedRooms.get(num);
    } else {
      roomData = this.interpretRoom(num);

      // fix tiles
      this.fixTiles(roomData, num, TILE_HACKS);
      if (this.trapOpened) this.fixTiles(roomData, num, MIRROR_HACKS);

      this.interpretedRooms.set(num, roomData);
    }

    this.renderRoom(roomData);
    
  }

  fixTiles(roomData, roomId, hacks) {

    for (const hack of hacks) {

      if (hack.roomId == roomId) {

        if (hack.type == 0) {
          roomData[hack.posX][hack.posY][hack.priority].depthX = hack.depthX;
          roomData[hack.posX][hack.posY][hack.priority].depthY = hack.depthY;
        } else {
          roomData[hack.posX][hack.posY].push({ tile: hack.tile, depthX: hack.depthX, depthY: hack.depthY});
        }
        
      }

    }

  }

  interpretRoom(num) {
    const blocks = this.rooms[num - 1].blocks;

    this.scriptInterpreter.clearTileBuffer();

    for (let j = 0; j < blocks.length; j++) {

      this.scriptInterpreter.executeBlock(blocks[j]);

    }

    return this.scriptInterpreter.getTileBuffer();
  }

  tileVisible(tile, sprite) {

    if (this.tilePainted[tile.id]) return true;

    if (tile.depthX < (sprite.x + 1)) {
      if (tile.depthY < (sprite.y + 1)) {
        return false;
      }
    }
    return true;
  }

  getRoomConnections(fl, rx, ry) {
    return this.floors[fl].connections[ry][rx];
  }

  getRoom(fl, rx, ry) {
    if ( (fl < 0) || (fl > 2) || ( rx < 0 ) || (rx > 15) || (ry < 0) || (ry > 15) ) return 0;
    return this.floors[fl].room[ry][rx];
  }

  normalizeCoordinates(rx, ry, x, y) {

    if (x < 0) {
      rx--;
      x &= 0xF;
    }

    if (y < 0) {
      ry--;
      y &= 0xF;
    }

    if (x > 15) {
      rx++;
      x &= 0xF;
    }

    if (y > 15) {
      ry++;
      y &= 0xF;
    }

    return {rx, ry, x, y};

  }

  getHeight(fl, rx, ry, x, y) {

    const coords = this.normalizeCoordinates(rx, ry, x, y);

    if (coords.rx == 11 && coords.ry == 1) {
      if (coords.y > 10) return this.monksCellWall[15 - coords.y][coords.x];
      return 2;
    }

    const room = this.getRoom(fl, coords.rx, coords.ry);
    if (room == 0) return 14;

    return this.rooms[room - 1].heightData[coords.y][coords.x];

  }

  updateHeight(fl, rx, ry, x, y, v) {

    const height = this.getHeight(fl, rx, ry, x, y);
    this.setHeight(fl, rx, ry, x, y, (height & 0x0F) | v);
    
  }

  setHeight(fl, rx, ry, x, y, v) {

    const coords = this.normalizeCoordinates(rx, ry, x, y);

    if (coords.rx == 11 && coords.ry == 1) {
      if (coords.y > 13) this.monksCellWall[15 - coords.y][coords.x] = v;
      return;
    }

    const room = this.getRoom(fl, coords.rx, coords.ry);
    if (room == 0) return;
    this.rooms[room - 1].heightData[coords.y][coords.x] = v;
    
  }

  getOverlappingTiles(targetSprite) {
    let overlappingTiles = [];
    
    this.currentRoomSprites.forEach(gameObject => {
        
        if (gameObject instanceof Phaser.GameObjects.Sprite && gameObject !== targetSprite) {
            
            if (Phaser.Geom.Intersects.RectangleToRectangle(
                targetSprite.getBounds(),
                gameObject.getBounds()
            )) {
              overlappingTiles.push(gameObject);
            }
        }
    });
    
    return overlappingTiles;
  }


  reOrderTiles(sprite, position) {

    const tiles = this.getOverlappingTiles(sprite);

    tiles.sort((a, b) => a.priority - b.priority);

    for ( const tile of tiles) {
    
      if (this.tileVisible(tile, position)) {
        
        this.tilePainted[tile.id] = true;

        if (sprite.depth >= tile.depth ) {
          tile.depth = sprite.depth + 1;
        }

      } else {
        
        if (sprite.depth <= tile.depth) {
          tile.depth = sprite.depth - 1;
        }
      }

    }

    this.tilePainted.fill(false);
    
  }

  renderRoom(roomData) {

    const time = this.scene.logic.isNight() ? "night" : "day";
    const backgroundColor = this.scene.logic.isNight() ? BACKGROUND_COLOR_NIGHT : BACKGROUND_COLOR_DAY;
    this.scene.cameras.main.setBackgroundColor(backgroundColor);
    
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 20; y++) {
        
        const tiles = roomData[x][y];

        let sprite;

        let index = 0;
        
        for (const tileInfo of tiles) {
          
          let depth = tileInfo.depthX + tileInfo.depthY - 16;
      
          sprite = this.scene.add.sprite(
            SCREEN_OFFSET_X + x * 16, 
            y * 8, 
            `tiles_${time}`, 
            'tile' + tileInfo.tile
          ).setOrigin(0, 0).setDepth(depth);

          sprite.depthX = tileInfo.depthX;
          sprite.depthY = tileInfo.depthY;
          sprite.priority = index++;
          sprite.id = y * 16 + x;

          this.currentRoomSprites.push(sprite);
          if (this.debugMode) sprite.setAlpha(0.2);
        }

        if (this.debugMode) {

          const tileInfo = tiles.slice(-1);
          if (tileInfo[0]) {
            const debugText = this.scene.add.text(
              SCREEN_OFFSET_X + x * 16, 
              y * 8, 
              `${tileInfo[0].tile}`, 
              { font: '8px Courier', fill: '#00FFFF' }
            ).setOrigin(0, 0);
            debugText.setDepth(1000);
            this.currentRoomSprites.push(debugText);
          }
        } 
        
      }
    }
  }

  clearCurrentRoom() {
    for (const sprite of this.currentRoomSprites) {
      sprite.destroy();
    }
    this.currentRoomSprites = [];
  }

  closeMirror() {
    
    this.activateMirror(true);

  }

  openMirror() {

    this.activateMirror(false);

  }

  activateMirror(close) {

    const r = this.rooms[AbadiaBuilder.MIRROR_ROOM - 1];

    // Height data for mirror (6 with mirror, 4 without mirror)
    for (let i=4; i<14; i++) {
      r.heightData[i][0] = close ? 6 : 4;
    }
    
    // Standard floor y-strips param number ( 0 shows mirror, 2 hide mirror)
    r.blocks[AbadiaBuilder.MIRROR_BLOCK].param2 = close ? 0 : 2;

    this.interpretedRooms.delete(AbadiaBuilder.MIRROR_ROOM);

  }

  openTrap() {

    // Hide floor to simulate trap - Block type 0x44 do nothing - Block type 0x1E (default) builds standard floor
    this.rooms[AbadiaBuilder.MIRROR_ROOM - 1].blocks[AbadiaBuilder.MIRROR_BLOCK].type = 0x44;

    // hack floor to hide Guillermo while falling in mirror room
    this.rooms[AbadiaBuilder.MIRROR_ROOM - 1].blocks[0].height = 8;
    this.trapOpened = true;

    this.interpretedRooms.delete(AbadiaBuilder.MIRROR_ROOM);

  }

}

export default AbadiaBuilder;