export const TICK_TIME = 45 * 1000 / 256;

export const ORIENTATION = {
    SOUTH_EAST: 0,
    NORTH_EAST: 1,
    NORTH_WEST: 2,
    SOUTH_WEST: 3
};

export const FLOOR = {
    MAIN: 0,
    SCRIPTORIUM: 1,
    LIBRARY: 2
}

export const FLOOR_HEIGHT = 12;

export const SCREEN_OFFSET_X = ( 320 - 256 ) / 2;

export const TEXT_COLOR_DAY = 0xFFFF80;
export const TEXT_COLOR_NIGHT = 0x808080;
export const BACKGROUND_COLOR_DAY = 0x008080;
export const BACKGROUND_COLOR_NIGHT = 0x000080;

export const TILE_HACKS = [

    // fix stair in room 38
    { type: 0, roomId: 38, posX: 9, posY: 11, priority: 0, depthX: 21, depthY: 19 }, 
    
    // fix stair in room 8
    { type: 0, roomId:  8, posX: 9, posY: 10, priority: 0, depthX: 19, depthY: 16 }, 
    
    // fix door in room 72
    { type: 0, roomId: 72, posX: 2, posY:  5, priority: 0, depthX: 15, depthY: 20 },
    { type: 0, roomId: 72, posX: 2, posY:  5, priority: 1, depthX: 15, depthY: 20 }, 
    
    // fix portico in mirror room
    { type: 0, roomId: 116, posX: 6, posY:  4, priority: 1, depthX: 19, depthY: 21 }, 
    { type: 0, roomId: 116, posX: 6, posY:  4, priority: 2, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 5, posY:  4, priority: 1, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 5, posY:  3, priority: 1, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 6, posY:  3, priority: 2, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 6, posY:  3, priority: 3, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 7, posY:  3, priority: 1, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 7, posY:  2, priority: 1, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 8, posY:  2, priority: 1, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 8, posY:  1, priority: 1, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 9, posY:  1, priority: 1, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 9, posY:  1, priority: 2, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 9, posY:  0, priority: 2, depthX: 19, depthY: 21 },
    { type: 0, roomId: 116, posX: 9, posY:  0, priority: 3, depthX: 19, depthY: 21 },

    // fix library in mirror room
    { type: 1, roomId: 116, posX: 1, posY: 0, tile: 172, depthX: 0, depthY: 0 },
    { type: 1, roomId: 116, posX: 1, posY: 1, tile: 171, depthX: 0, depthY: 0 },
    { type: 1, roomId: 116, posX: 0, posY: 1, tile: 172, depthX: 0, depthY: 0 },
    { type: 1, roomId: 116, posX: 0, posY: 2, tile: 171, depthX: 0, depthY: 0 },

    // fix door in room 78
    { type: 0, roomId: 78, posX: 13, posY: 4, priority: 0, depthX: 14, depthY: 10}
];

export const MIRROR_HACKS = [
    // hack floor to hide Guillermo while falling in mirror room
    { type: 0, roomId: 115, posX: 3, posY: 9, priority: 0, depthX: 17, depthY: 17 },
    { type: 0, roomId: 115, posX: 5, posY: 7, priority: 0, depthX: 17, depthY: 17 },
];
