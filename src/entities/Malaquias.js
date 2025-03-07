import Monk from './Monk';
import GameLogic from '../logic/GameLogic';
import Item from './Item';
import Door from './Door';
import { ORIENTATION, FLOOR, TICK_TIME } from '../constants';

class Malaquias extends Monk {
    constructor(scene, config) {
        super(scene, config, 'malaquias');

        this.phrase0x33 = false;
        this.phrase0x34 = false;

        this.initDefaultPositions();
        this.initControls();

        this.tags['guillermoInScriptorium'] = false;
    }

    initControls() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
    }

    initDefaultPositions() {
        this.defaultPositions = [
            { floor: FLOOR.MAIN, room: { x: 8, y: 4 }, position: { x: 4, y: 8}, orientation: ORIENTATION.NORTH_EAST, height: 2 }, // church
            { floor: FLOOR.MAIN, room: { x: 2, y: 3 }, position: { x: 15, y: 7}, orientation: ORIENTATION.SOUTH_WEST, height: 2 },  // refectory
            { floor: FLOOR.SCRIPTORIUM, room: { x: 3, y: 3 }, position: { x: 7, y: 8}, orientation: ORIENTATION.NORTH_EAST, height: 4 },  // passage to laberinth
            { floor: FLOOR.SCRIPTORIUM, room: { x: 3, y: 3 }, position: { x: 10, y: 4}, orientation: ORIENTATION.NORTH_WEST, height: 4 },  // passage to laberinth (stop guillermo)
            { floor: FLOOR.MAIN, room: { x: 5, y: 7 }, position: { x: 13, y: 7}, orientation: ORIENTATION.SOUTH_EAST, height: 0 },  // big door
            { floor: FLOOR.MAIN, room: { x: 5, y: 2 }, position: { x: 8, y: 10}, orientation: ORIENTATION.SOUTH_EAST, height: 0 },  // kitchen
            { floor: FLOOR.SCRIPTORIUM, room: { x: 3, y: 3 }, position: { x: 5, y: 7}, orientation: ORIENTATION.NORTH_EAST, height: 4 },  // passage to laberinth (leave key)
            { floor: FLOOR.MAIN, room: { x: 11, y: 1 }, position: { x: 12, y: 8}, orientation: ORIENTATION.SOUTH_EAST, height: 2 },  // malaquias's cell
            { floor: FLOOR.MAIN, room: { x: 6, y: 5 }, position: { x: 8, y: 2}, orientation: ORIENTATION.SOUTH_EAST, height: 0 }  // severino's cell
        ];
    }

    think() {

        const day = this.scene.logic.day;
        const timeOfDay = this.scene.logic.timeOfDay;
        const guillermo = this.scene.guillermo;

        if (this.scene.abad.state == 0x0B) {
            this.searchPath = false;

            return;
        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.NOCHE || timeOfDay == GameLogic.TIME_OF_DAY.COMPLETAS) {
            this.target = 7;
            this.state = 0x08;

            return;
        }
        
        if (timeOfDay == GameLogic.TIME_OF_DAY.VISPERAS) {

            if (this.state == 0x0C) {

                this.target = Monk.TARGET.ABAD;

                if (this.reached == Monk.TARGET.ABAD) {
                    this.scene.abad.state = 0x0B;
                    this.state = 0x06;
                }

                return;
            }

            if (this.state == 0) {

                this.authItems.add(Item.KEY3);
                this.target = 6;

                if (this.reached == 6) {
                    this.state = 2;
                } else {
                    return;
                }
            }

            if (this.state < 4) {

                if (guillermo.floor > 0) {
                    this.target = Monk.TARGET.GUILLERMO;
                } else {
                    this.state = 4;

                    return;
                }

                if (this.state == 2) {
                    
                    if (this.isCloseTo(guillermo)) {
                        this.scene.board.showPhrase(0x09, true);
                        this.state = 3;
                        this.addTagEvent('guillermoInScriptorium', 0xFA * TICK_TIME);
                    }

                    return;
                }

                if (this.state == 3) {

                    if (this.tags['guillermoInScriptorium']) {
                        this.scene.board.showPhrase(0x0A, true);
                        this.state = 0x0C;
                        this.removeTagEvent('guillermoInScriptorium');
                    }

                    return;
                }
            }

            if (this.state == 4) {

                this.target = 4;

                const berengarioX = (this.scene.berengario.room.x << 4) | this.scene.berengario.position.x;
                const bernardoX = (this.scene.bernardo.room.x << 4) | this.scene.berengario.position.x;

                if (this.reached == 4) {

                    if ((this.scene.berengario.isActive && berengarioX < 0x62) || (this.scene.bernardo.isActive && bernardoX < 0x62)) {
                        this.searchPath = false;
                    } else {
                        this.state = 5;
                        this.scene.doors[Door.BIG].fixed = false;
                        this.scene.doors[Door.BIG + 1].fixed = false;
                    }
                }

                return;

            }

            if (this.state == 5) {
                this.target = 5;

                this.scene.doors[Door.PASSAGE].locked = false;
                this.scene.doors[Door.BIG].locked = true;
                this.scene.doors[Door.BIG + 1].locked = true;

                if (guillermo.room.x < 6 ) {
                    this.state = 0x0C;
                }

                if (this.reached == 5) {
                    this.state = 6;
                }

                return;
            }

            if (this.state == 6) {
                this.target = 0;
                if (this.reached == 0) {
                    this.state = 7;
                }
            }

            if (this.state == 0x0B) {

                if (!this.scene.board.displayingPhrase()) {
                    this.dieWithStyle();
                }

                return;
            }

            if (this.state == 7) {

                if (day == 5) {

                    if (this.scene.camera.currentRoom.x == 8 && this.scene.camera.currentRoom.y == 4) {

                        this.reached = 1;
                        this.state = 0x0B;

                        this.scene.board.showPhrase(0x1F, true);
                    }
                }

                return;
            }

            return;

        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.PRIMA) {
            this.state = 0x09;
            this.target = 0;

            return;
        }

        if (this.reached == 2) {

            this.state = 0;
            if (this.inventory.has(Item.KEY3)) {
                this.leaveItem(Item.KEY3);
                this.authItems.delete(Item.KEY3);
            }
            
        }

        if (this.state == 0) {

            if (this.isCloseTo(guillermo)) {

                if (this.target == 3) {

                    if (!this.phrase0x33) {
                        
                        const y = (guillermo.room.y << 4) | guillermo.position.y;
                        
                        if (y < 0x38) {
                            this.phrase0x33 = true;
                            this.scene.board.showPhrase(0x33, true);
                        }

                    } else {

                        if (!this.phrase0x34) {

                            if (day == 2 && !this.scene.board.displayingPhrase()) {

                                this.phrase0x34 = true;
                                this.scene.board.showPhrase(0x34);
                            }
                        }
                    }

                    return;
                }

                this.resetActions();

                if (this.cursors.up.isDown) {

                    this.target = 3;

                } else {
                    
                    this.searchPath = false;

                }

            } else {

                this.target = 2;

            }

            return;
        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.TERCIA) {

            if (this.state == 9 && day == 5) {

                this.target = 8;

                if (this.reached == 8 && this.scene.severino.reached == 2) {
                    this.scene.severino.inactive();
                    this.state = 0x0A;
                }

                return;

            }

            this.state = 0x0A;
            this.target = 2;
            
        }
        
    }

    dieWithStyle() {

        this.scene.tweens.add({
            targets: this.sprite, 
            y: this.sprite.y - 100,
            duration: 2000,
            ease: 'Linear',
            onComplete: () => {
                this.reached = 0;
                this.inactive();
            }
        });
        
    }

}



export default Malaquias;