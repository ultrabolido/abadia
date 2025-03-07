import { FLOOR, ORIENTATION } from '../constants';
import Item from '../entities/Item';
import Door from '../entities/Door';
import Actor from '../entities/Actor';

export const ACTOR = {
    guillermo: {
        name: 'Guillermo',
        position: { x: 8, y: 8 },
        room: { x: 8, y: 10 },
        height: 0,
        floor: FLOOR.MAIN,
        inventory: [ Item.GLASSES ],
        authDoors: [ Door.CHURCH_CELLS ],
        authItems: [ Item.BOOK, Item.GLOVES, Item.GLASSES, Item.SCROLL, Item.KEY1, Item.KEY2 ]
    },
    adso: {
        name: 'Adso',
        position: { x: 6, y: 10 },
        room: { x: 8, y: 10 },
        height: 0,
        floor: FLOOR.MAIN,
        authDoors: [ Door.CHURCH_CELLS ],
        pathDoors: [ Door.BIG, Door.PASSAGE, Door.CHURCH_CELLS, Door.SEVERINO_CELL ],
        authItems: [ Item.KEY3, Item.LAMP ]
    },
    abad: {
        name: 'Abad',
        position: { x: 8, y: 4 },
        room: { x: 8, y: 8 },
        height: 2,
        floor: FLOOR.MAIN,
        authDoors: [ Door.PASSAGE, Door.CHURCH_CELLS, Door.ABAD_CELL ],
        pathDoors: [ Door.BIG, Door.PASSAGE, Door.CHURCH_CELLS, Door.SEVERINO_CELL, Door.MONKS_CELL, Door.ABAD_CELL ],
        authItems: [ Item.SCROLL ],
        pickpocket: true
    },
    severino: {
        name: 'Severino',
        position: { x: 8, y: 8 },
        room: { x: 12, y: 2 },
        height: 0,
        floor: FLOOR.MAIN,
        authDoors: [ Door.CHURCH_CELLS, Door.SEVERINO_CELL ],
        pathDoors: [ Door.BIG, Door.CHURCH_CELLS, Door.SEVERINO_CELL, Door.MONKS_CELL, Door.ABAD_CELL ]
    },
    berengario: {
        name: 'Berengario',
        position: { x: 8, y: 8 },
        room: { x: 2, y: 4 },
        height: 4,
        floor: FLOOR.SCRIPTORIUM,
        authDoors: [ Door.PASSAGE, Door.CHURCH_CELLS, Door.SEVERINO_CELL, Door.MONKS_CELL, Door.ABAD_CELL ],
        pathDoors: [ Door.BIG, Door.PASSAGE, Door.CHURCH_CELLS, Door.SEVERINO_CELL, Door.MONKS_CELL, Door.ABAD_CELL ]
    },
    malaquias: {
        name: 'Malaquias',
        position: { x: 6, y: 6 },
        room: { x: 2, y: 2 },
        height: 4,
        floor: FLOOR.SCRIPTORIUM,
        authDoors: [ Door.PASSAGE, Door.CHURCH_CELLS, Door.SEVERINO_CELL, Door.MONKS_CELL, Door.ABAD_CELL ],
        pathDoors: [ Door.BIG, Door.PASSAGE, Door.CHURCH_CELLS, Door.SEVERINO_CELL, Door.MONKS_CELL, Door.ABAD_CELL ]
    },
    bernardo: {
        name: 'Bernardo Gui',
        position: { x: 0, y: 0 },
        room: { x: 0, y: 0 },
        height: 0,
        floor: FLOOR.MAIN,
        authDoors: [ Door.PASSAGE, Door.CHURCH_CELLS, Door.SEVERINO_CELL, Door.MONKS_CELL, Door.ABAD_CELL ],
        pathDoors: [ Door.BIG, Door.PASSAGE, Door.CHURCH_CELLS, Door.SEVERINO_CELL, Door.MONKS_CELL, Door.ABAD_CELL ],
        authItems: [ Item.SCROLL ],
        pickpocket: true,
        isActive: false
    },
    jorge: {
        name: 'Jorge',
        position: { x: 0, y: 0 },
        room: { x: 0, y: 0 },
        height: 0,
        floor: FLOOR.MAIN,
        authDoors: [ Door.PASSAGE, Door.CHURCH_CELLS, Door.SEVERINO_CELL, Door.MONKS_CELL, Door.ABAD_CELL ],
        pathDoors: [ Door.BIG, Door.PASSAGE, Door.CHURCH_CELLS, Door.SEVERINO_CELL, Door.MONKS_CELL, Door.ABAD_CELL ],
        isActive: false
    }
};

export const DOOR = [
    {
        id: Door.ABAD_CELL,
        position: { x: 1, y: 7 },
        room: { x: 6, y: 3 },
        height: 2,
        orientation: ORIENTATION.NORTH_EAST,
        inward: true
    },
    {
        id: Door.MONKS_CELL,
        position: { x: 7, y: 14 },
        room: { x: 11, y: 1 },
        height: 2,
        orientation: ORIENTATION.NORTH_WEST,
        inward: true
    },
    {
        id: Door.SEVERINO_CELL,
        position: { x: 6, y: 15 },
        room: { x: 6, y: 5 },
        height: 2,
        orientation: ORIENTATION.SOUTH_EAST,
        inward: false
    },
    {
        id: Door.CHURCH_CELLS,
        position: { x: 14, y: 8 },
        room: { x: 9, y: 2 },
        height: 2,
        orientation: ORIENTATION.SOUTH_WEST,
        inward: true
    },
    {
        id: Door.PASSAGE,
        position: { x: 14, y: 6 },
        room: { x: 7, y: 2 },
        height: 2,
        orientation: ORIENTATION.SOUTH_WEST,
        inward: false,
        locked: true
    },
    {
        id: Door.BIG,
        position: { x: 0, y: 6 },
        room: { x: 6, y: 7 },
        height: 0,
        orientation: ORIENTATION.NORTH_WEST,
        inward: true,
        fixed: true,
        open: true
    },
    {
        id: Door.BIG,
        position: { x: 0, y: 11 },
        room: { x: 6, y: 7 },
        height: 0,
        orientation: ORIENTATION.NORTH_WEST,
        inward: false,
        fixed: true,
        open: true
    }

];

export const ITEM = [
    {
        id: Item.BOOK,
        position: { x: 4, y: 14 },
        room: { x: 3, y: 5 },
        height: 8,
        floor: FLOOR.SCRIPTORIUM,
        orientation: ORIENTATION.NORTH_EAST
    },
    {
        id: Item.GLOVES,
        position: { x: 11, y: 5 },
        room: { x: 6, y: 5 },
        height: 6,
        floor: FLOOR.MAIN,
        orientation: ORIENTATION.SOUTH_EAST
    },
    {
        id: Item.GLASSES,
        actor: Actor.GUILLERMO
    },
    {
        id: Item.SCROLL,
        position: { x: 6, y: 14 },
        room: { x: 3, y: 5 },
        height: 8,
        floor: FLOOR.SCRIPTORIUM,
        orientation: ORIENTATION.NORTH_EAST
    },
    {
        id: Item.KEY1,
        hidden: true
    },
    {
        id: Item.KEY2,
        hidden: true
    },
    {
        id: Item.KEY3,
        position: { x: 5, y: 5 },
        room: { x: 3, y: 3 },
        height: 8,
        floor: FLOOR.SCRIPTORIUM
    },
    {
        id: Item.LAMP,
        hidden: true
    }

];