import Monk from './Monk';
import Actor from './Actor';
import Item from './Item';
import Door from './Door';
import GameLogic from '../logic/GameLogic';
import { ORIENTATION, FLOOR, TICK_TIME } from '../constants';
import { CONFIG } from '../config';

class Abad extends Monk {
    
    static ACT_POSITION = {
        BAD_NOT_IN_ROOM: 0,
        BAD_NOT_IN_POSITION: 1,
        CORRECT: 2,
    };

    static CHURCH_PHRASE_PRIMA = [0, 0x15, 0x18, 0x1a, 0x17, 0x17, 0x17];

    static GUILLERMO_POSITION = [
        { roomX: 8, roomY: 4, posX: 4, posY: 11, orientation: ORIENTATION.NORTH_EAST },
        { roomX: 3, roomY: 3, posX: 8, posY: 9, orientation: ORIENTATION.NORTH_EAST }
    ];

    static ACT_PLACE = {
        CHURCH: 0,
        REFECTORY: 1
    };

    static MONKS_IN_CHURCH_VISPERAS = [ 
        [ Actor.ADSO, Actor.MALAQUIAS, Actor.BERENGARIO, Actor.SEVERINO ],
        [ Actor.ADSO, Actor.MALAQUIAS, Actor.BERENGARIO, Actor.SEVERINO ],
        [ Actor.ADSO, Actor.MALAQUIAS,                   Actor.SEVERINO ],
        [ Actor.ADSO, Actor.MALAQUIAS,                   Actor.SEVERINO, Actor.BERNARDO ],
        [ ],
        [ Actor.ADSO ],
        [ ] 
    ];

    static MONKS_IN_CHURCH_PRIMA = [ 
        [ ],
        [ Actor.ADSO, Actor.MALAQUIAS, Actor.BERENGARIO, Actor.SEVERINO ],
        [ Actor.ADSO, Actor.MALAQUIAS,                   Actor.SEVERINO ],
        [ Actor.ADSO, Actor.MALAQUIAS,                   Actor.SEVERINO ],
        [ Actor.ADSO, Actor.MALAQUIAS,                   Actor.SEVERINO, Actor.BERNARDO ],
        [ Actor.ADSO ],
        [ Actor.ADSO ]
    ];

    static MONKS_IN_REFECTORY = [ 
        [ ],
        [ Actor.ADSO, Actor.BERENGARIO, Actor.SEVERINO ],
        [ Actor.ADSO, Actor.SEVERINO ],
        [ Actor.ADSO, Actor.SEVERINO ],
        [ Actor.ADSO ],
        [ Actor.ADSO ],
        [ ]
    ];
    
    constructor(scene, config) {
        super(scene, config, 'abad');
        this.initDefaultPositions();

        this.guillermoHasTheScroll = false;

        this.tags['requestScroll'] = false;
        this.tags['guillermoUnpunctual'] = false;
        this.tags['guillermoNotInPosition'] = false;
        this.tags['guillermoNotInAct'] = false;
        this.tags['guillermoNotInCell'] = false;
        this.tags['abadWakesUp'] = false;
        this.tags['waitInSeverinoCell'] = false;

    }

    initDefaultPositions() {
        this.defaultPositions = [
            { floor: FLOOR.MAIN, room: { x: 8, y:  3 }, position: { x: 8, y: 12 }, orientation: ORIENTATION.SOUTH_WEST, height: 4 }, // altar
            { floor: FLOOR.MAIN, room: { x: 3, y:  3 }, position: { x: 13, y:  7 }, orientation: ORIENTATION.NORTH_WEST, height: 2 }, // refectory
            { floor: FLOOR.MAIN, room: { x: 5, y:  3 }, position: { x: 4, y: 12 }, orientation: ORIENTATION.SOUTH_EAST, height: 2 }, // abad's cell
            { floor: FLOOR.MAIN, room: { x: 8, y:  8 }, position: { x: 8, y:  4 }, orientation: ORIENTATION.SOUTH_WEST, height: 2 }, // abbey's entry
            { floor: FLOOR.MAIN, room: { x: 10, y: 5 }, position: { x: 4, y:  8 }, orientation: ORIENTATION.NORTH_EAST, height: 0 }, // welcome first stop
            { floor: FLOOR.MAIN, room: { x: 10, y: 2 }, position: { x: 5, y:  1 }, orientation: ORIENTATION.SOUTH_EAST, height: 2 }, // guillermo's cell entry
            { floor: FLOOR.MAIN, room: { x: 9, y:  2 }, position: { x: 12, y:  10 }, orientation: ORIENTATION.SOUTH_EAST, height: 2 }, // church door
            { floor: FLOOR.MAIN, room: { x: 12, y: 2 }, position: { x: 7, y:  7 }, orientation: ORIENTATION.SOUTH_EAST, height: 0 }, // jorge's meeting
            { floor: FLOOR.MAIN, room: { x: 6, y: 6 }, position: { x: 8, y:  1 }, orientation: ORIENTATION.NORTH_EAST, height: 2 }, // severino's cell
            { floor: FLOOR.SCRIPTORIUM, room: { x: 3, y: 3 }, position: { x: 10, y:  4 }, orientation: ORIENTATION.SOUTH_EAST, height: 2 } // library passage
        ];

        if (CONFIG.abad_alternate_cell_position) this.defaultPositions[2].orientation = ORIENTATION.SOUTH_WEST;
    }

    think() {

        const day = this.scene.logic.day;
        const timeOfDay = this.scene.logic.timeOfDay;
        const guillermo = this.scene.guillermo;

        if ((guillermo.room.x < 6) && ((day == 1) || (timeOfDay == GameLogic.TIME_OF_DAY.PRIMA))) {
            this.state = 0x0B;
        }
        
        if ((timeOfDay >= GameLogic.TIME_OF_DAY.PRIMA) && (guillermo.floor > 1)) {
            this.target = 9;
            this.state = 0x0B;
            return;
        }

        if (this.state === 0x0B) {

            this.target = Monk.TARGET.GUILLERMO;

            if (this.isCloseTo(guillermo)) {
                if (!this.scene.logic.gameOver && !this.scene.board.displayingPhrase()) {
                    this.scene.board.showPhrase(0x0E);
                    this.scene.logic.gameOver = true;
                }
            }

            return;

        }

        // guillermo is in the abad's cell
        if ((guillermo.room.x == 5) && (guillermo.room.y == 3)) {

            if (this.isCloseTo(guillermo)) {
                this.target = Monk.TARGET.GUILLERMO;
                this.scene.board.showPhrase(0x29);
                this.state = 0x0B;
            } else {
                this.target = 2;
            }

            return;
        }

        if ((this.reached == 2) && (this.reached == this.target) && this.inventory.has(Item.SCROLL)) {

            this.scene.logic.savedScroll = true;

            this.leaveItem(Item.SCROLL);
            this.authItems.delete(Item.SCROLL);

            if (this.state == 0x15 && !this.inventory.has(Item.SCROLL)) {

                this.state = 0x10;
                this.scene.logic.advanceTimeOfDay = true;

                return;
            }

        }

        if (this.state == 0x15) {
            this.target = 2;

            return;
        }

        // admonishing Guillermo
        if (this.state >= 0x80) {
            if (!this.scene.board.displayingPhrase()) {
                this.state &= 0x7F;
            } else {
                this.target = Monk.TARGET.GUILLERMO;

                return;
            }
        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.VISPERAS) {

            this.state = 0x05;
            this.target = 0;

            let guillermoInChurch = this.checkGuillermoIn(Abad.ACT_PLACE.CHURCH);
            let allMonksInChurch = this.checkMonksIn(Abad.ACT_PLACE.CHURCH);

            let phraseId = 0x17;

            if (day == 5) {
                if (!this.scene.malaquias.isActive) {
                    phraseId = 0x20;
                    allMonksInChurch = true;
                } else {
                    allMonksInChurch = false;
                }
            }

            return this.actMustBegin(guillermoInChurch, allMonksInChurch, phraseId);

        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.PRIMA) {

            this.state = 0x0E;
            this.target = 0;

            let guillermoInChurch = this.checkGuillermoIn(Abad.ACT_PLACE.CHURCH);
            let allMonksInChurch = this.checkMonksIn(Abad.ACT_PLACE.CHURCH);

            const phraseId = Abad.CHURCH_PHRASE_PRIMA[day - 1];

            return this.actMustBegin(guillermoInChurch, allMonksInChurch, phraseId);

        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.SEXTA) {

            this.state = 0x10;
            this.target = 1;

            let guillermoInRefectory = this.checkGuillermoIn(Abad.ACT_PLACE.REFECTORY);
            let allMonksInRefectory = this.checkMonksIn(Abad.ACT_PLACE.REFECTORY);

            return this.actMustBegin(guillermoInRefectory, allMonksInRefectory, 0x19);

        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.COMPLETAS && this.state == 0x05) {

            this.state = 0x06;

            const camera = this.scene.camera;
            if (camera.currentRoom.x == 8 && camera.currentRoom.y == 4 && camera.currentFloor == 0) {

                this.scene.board.showPhrase(0x0D);

            }

            return;
        }

        if (this.guillermoHasTheScroll) {

            this.target = Monk.TARGET.GUILLERMO;

            if (this.inventory.has(Item.SCROLL)) {
                
                this.state = 0x15;
                this.reached = Monk.TARGET.GUILLERMO;
                this.guillermoHasTheScroll = false;

                return;

            } else {

                if (this.isCloseTo(guillermo)) {

                    if (this.tags['requestScroll']) {
                        this.scene.board.showPhrase(0x05);
                        this.scene.logic.decrementObsequium(2);
                        this.removeTagEvent('requestScroll');
                    }

                    this.addTagEvent('requestScroll', 0xC8 * TICK_TIME);

                } else {

                    this.removeTagEvent('requestScroll');
                    this.tags['requestScroll'] = true;
                }

                return;

            }

        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.COMPLETAS) {

            if (this.state == 0x06) {

                if (!this.scene.board.displayingPhrase()) {
                    this.target = 5;

                    if (this.target == this.reached) {
                        this.state++;
                    }
                }

                return;
            }

            if (this.state == 0x07) {

                if (guillermo.room.x == 10 && guillermo.room.y == 1) {

                    this.state = 0x09;

                } else {

                    if (this.isCloseTo(guillermo)) {

                        this.state = 0x08;
                        this.scene.board.showPhrase(0x10);

                    } else {
                        
                        this.addTagEvent('guillermoNotInCell', 0x32 * TICK_TIME);

                        if (this.tags['guillermoNotInCell']) {
                            this.state = 0x08;
                        }

                    }
                }

                return;
            }

            if (this.state == 0x08) {

                if (guillermo.room.x == 10 && guillermo.room.y == 1) {

                    this.state = 0x09;
                
                } else {

                    this.addTagEvent('guillermoNotInCell', 0x32 * TICK_TIME);

                    if (this.isCloseTo(guillermo)) {

                        if (this.tags['guillermoNotInCell']) {
                            this.scene.board.showPhrase(0x10);
                            this.scene.logic.decrementObsequium(2);
                            this.removeTagEvent('guillermoNotInCell');
                        }

                    } else {
                        this.target = Monk.TARGET.GUILLERMO;
                    }

                }

                return;
            }

            if (this.state == 0x09) {

                if (guillermo.room.x == 10 && guillermo.room.y == 1) {

                    this.target = 6;
                    if (this.target == this.reached) this.state = 0x0A;

                } else {

                    this.resetActions();
                    this.state = 0x08;
                    this.target = Monk.TARGET.GUILLERMO;
                }

                return;
            }

            if (this.state == 0x0A) {
                this.scene.logic.advanceTimeOfDay = true;
                this.scene.doors[Door.CHURCH_CELLS].locked = true;
            }

            return;
        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.NOCHE) {

            this.target = 2;

            if (this.state == 0x0A && this.reached == 2) {

                this.addTagEvent('abadWakesUp', 0xFA * TICK_TIME);
                this.state = 0x0C;

            }

            if (this.state == 0x0C) {

                if (guillermo.room.x >= 6) {

                    this.resumeTagEvent('abadWakesUp');

                    if (this.tags['abadWakesUp'] || (day == 5 && guillermo.inventory.has(Item.KEY1))) {
                        this.state = 0x0D;
                    }

                } else {
                    this.pauseTagEvent('abadWakesUp');
                }

                return;
            }

            if (this.state == 0x0D) {

                this.removeTagEvent('abadWakesUp');

                if (guillermo.room.x < 6 || (guillermo.room.x == 10 && guillermo.room.y == 1)) {

                    this.addTagEvent('abadWakesUp', 0xFA * TICK_TIME, 0x32 * TICK_TIME);
                    this.state = 0x0C;
                } else {

                    if (this.isCloseTo(guillermo)) {
                        this.state = 0x0B;
                    }

                    this.target = Monk.TARGET.GUILLERMO;

                }
            }

            return;

        }

        if (day == 1) {
            if (timeOfDay == GameLogic.TIME_OF_DAY.NONA) {
                
                if (this.state == 0x04) {
                    this.target = 2;

                    if (this.reached == 2) {
                        this.scene.logic.advanceTimeOfDay = true;
                    }

                    return;
                }

                if (this.state == 0) {
                    if (this.isCloseTo(guillermo)) {
                        this.scene.board.showPhrase(0x01);

                        this.state = 0x01;
                        this.target = Monk.TARGET.GUILLERMO;
                    } else {
                        this.target = 3;
                    }

                    return;
                }

                if (this.isCloseTo(guillermo)) {

                    if (this.state == 0x01) {

                        if ((this.target == 4) && (!this.scene.board.displayingPhrase())) {
                            this.state = 0x02;
                        } else {
                            if (!this.scene.board.displayingPhrase()) {
                                this.scene.board.showPhrase(0x02);
                                this.target = 4;
                            }
                        }

                    }

                    if (this.state == 0x02) {
                        this.target = 4;

                        if ((this.reached == 4) && (!this.scene.board.displayingPhrase())) {
                            this.state = 0x03;
                        }
                    }

                    if (this.state == 0x03) {

                        if ((this.target == 5) && (!this.scene.board.displayingPhrase())) {
                            this.state = 0x1F;
                        } else {
                            if (!this.scene.board.displayingPhrase()) {
                                this.scene.board.showPhrase(0x03);
                                this.target = 5;
                            }
                        }
                    }

                    if (this.state == 0x1F) {
                        this.target = 5;

                        if ((this.reached == 5) && (!this.scene.board.displayingPhrase())) {
                            this.state = 0x04;
                            this.scene.board.showPhrase(0x07);
                        }
                    }

                    return;

                } else {
                    return this.advertGuillermo();
                }
            }
        }

        if (day == 2) {
            this.talkOrWalk(0x16);

            return;
        }

        if (day == 3) {

            if (this.state == 0x10 && timeOfDay == GameLogic.TIME_OF_DAY.TERCIA) {

                if (this.isCloseTo(guillermo)) {
                    this.target = 7;
                } else {

                    if (this.scene.jorge.state >= 0x1E) {
                        this.scene.jorge.state--;

                        return;
                    }

                    this.scene.logic.advanceTimeOfDay = false;

                    this.advertGuillermo();
                }
            } else {
                this.talkOrWalk(0x30);
            }

            return;
        }

        if (day == 4) {
            this.talkOrWalk(0x11);

            return;
        }

        if (day == 5) {

            if (timeOfDay == GameLogic.TIME_OF_DAY.NONA) {

                if (this.reached == 8) {

                    if (this.tagEventElapsedTime('waitInSeverinoCell') == 0 && this.state != 0x10) this.scene.sound.playAudioSprite('sound', 'knock');

                    this.addTagEvent('waitInSeverinoCell', 0x15 * TICK_TIME);

                    if (this.tags['waitInSeverinoCell']) {

                        this.state = 0x10;

                        this.scene.board.showPhrase(0x1C);
                        this.scene.logic.advanceTimeOfDay = true;
                        this.removeTagEvent('waitInSeverinoCell');

                    }

                } else {

                    if (this.target == 8 || this.state == 0x13) {

                        if (this.state = 0x13) {

                            if (this.isCloseTo(guillermo)) {
                                this.target = 8;
                            } else {
                                this.advertGuillermo();
                            }

                        } else {
                            
                            if (!this.scene.board.displayingPhrase()) {
                                this.state = 0x13;
                            }

                        }

                    } else {
                        this.scene.board.showPhrase(0x1B, true);

                        this.target = 8;
                    }

                }

            } else {
                
                this.talkOrWalk(0x1D);

            }

            return;
        }

        if (day == 6) {
            
            this.talkOrWalk(0x1E);

            return;

        }

        if (day == 7) {

            if (timeOfDay == GameLogic.TIME_OF_DAY.TERCIA) {

                this.scene.logic.gameOver = true;

            }
            
            this.talkOrWalk(0x25);
        }

    }

    talkOrWalk(phraseId) {

        if (this.state == 0x10) {
            this.walk();
        } else {
            if (this.scene.logic.timeOfDay == GameLogic.TIME_OF_DAY.TERCIA) {
                this.talk(phraseId);
            }
        }
    }

    walk() {

        if (this.scene.malaquias.target == Monk.TARGET.ABAD || this.scene.berengario.target == Monk.TARGET.ABAD || this.scene.bernardo.target == Monk.TARGET.ABAD) {

            if (this.reached == this.target) {
                this.searchPath = false;
            } else {
                this.target = 2;

                if (this.scene.bernardo.inventory.has(Item.SCROLL)) {
                    this.target = 3
                }
            }
        } else {

            if (this.inventory.has(Item.SCROLL)) {
                this.target = 2;
            }

            if (this.reached == this.target) {
                this.target = Math.floor(Math.random() * 4) + 2;
            }

        }

    }

    talk(phraseId) {

        if (this.state == 0x0E) {
            this.scene.board.showPhrase(0x14);
            this.state = 0x11;
        }

        if (this.state == 0x11) {
            if (!this.scene.board.displayingPhrase()) {
                this.state = 0x12;
            }
        }

        if (this.state == 0x12) {
            this.state = 0x0F;
            this.target = 0;
            this.scene.board.showPhrase(phraseId);

            return;
        }

        if (this.state == 0x0F) {

            if (!this.scene.board.displayingPhrase()) {
                this.state = 0x10;
            } else {

                if (!this.isCloseTo(this.scene.guillermo)) {
                    this.state = 0x12;
                    this.advertGuillermo();
                }
            }
        }
    }

    advertGuillermo() {
        
        if (this.state < 0x80) {
            this.resetActions();

            this.scene.board.showPhrase(0x08, true);
            this.scene.logic.decrementObsequium(2);

            this.state |= 0x80;

            this.searchPath = false;
        }
    }

    actMustBegin(guillermoInPlace, allMonksInPlace, phraseId) {

        if (this.target == this.reached) {

            if (allMonksInPlace) {

                if (guillermoInPlace == Abad.ACT_POSITION.BAD_NOT_IN_POSITION || guillermoInPlace == Abad.ACT_POSITION.CORRECT) {

                    this.removeTagEvent('guillermoNotInAct');

                    if (this.tags['guillermoUnpunctual']) {

                        this.scene.board.showPhrase(0x06);
                        this.scene.logic.decrementObsequium(2);
                        this.removeTagEvent('guillermoUnpunctual');

                    } else {

                        this.removeTagEvent('guillermoUnpunctual');

                        if (!this.scene.board.displayingPhrase()) {

                            if (guillermoInPlace == Abad.ACT_POSITION.BAD_NOT_IN_POSITION) {

                                this.addTagEvent('guillermoNotInPosition', 0x1E * TICK_TIME);

                                if (this.tags['guillermoNotInPosition']) {

                                    this.scene.board.showPhrase(0x2D);
                                    this.scene.logic.decrementObsequium(2);
                                    this.removeTagEvent('guillermoNotInPosition');

                                }

                                return;
                                 
                            } else {

                                this.scene.board.showPhrase(phraseId);
                                this.scene.logic.advanceTimeOfDay = true;
                                this.removeTagEvent('guillermoNotInPosition');

                            }

                        }

                        if ((this.scene.logic.advanceTimeOfDay == true) && (guillermoInPlace == Abad.ACT_POSITION.BAD_NOT_IN_POSITION)) {

                            this.scene.logic.advanceTimeOfDay = false;
                            this.scene.board.showPhrase(0x2D, true);
                            this.scene.logic.decrementObsequium(2);

                        }

                    }


                } else {

                    this.addTagEvent('guillermoUnpunctual', 0x32 * TICK_TIME, this.tagEventElapsedTime('guillermoNotInPosition'));
                    this.addTagEvent('guillermoNotInAct', 0xC8 * TICK_TIME, this.tagEventElapsedTime('guillermoNotInPosition'));
                    this.removeTagEvent('guillermoNotInPosition');

                    if (this.tags['guillermoNotInAct']) {

                        this.state = 0x0B;
                        this.scene.logic.advanceTimeOfDay = true;
                        
                    }

                }
            }
        }
    }

    checkGuillermoIn(placeId) {

        const pos = Abad.GUILLERMO_POSITION[placeId];

        const guillermo = this.scene.guillermo;

        if (guillermo.floor > 0) return Abad.ACT_POSITION.BAD_NOT_IN_ROOM;

        const difX = pos.roomX - guillermo.room.x;
        const difY = pos.roomY - guillermo.room.y;

        if ( difX < 0 || difX > 1 ) return Abad.ACT_POSITION.BAD_NOT_IN_ROOM;
        if ( difY < 0 || difY > 1 ) return Abad.ACT_POSITION.BAD_NOT_IN_ROOM;
        if ( difY == 1 && difX == 1 ) return Abad.ACT_POSITION.BAD_NOT_IN_ROOM;

        if (difX != 0 || difY != 0) return Abad.ACT_POSITION.BAD_NOT_IN_POSITION;
        if (guillermo.position.x != pos.posX || guillermo.position.y != pos.posY) return Abad.ACT_POSITION.BAD_NOT_IN_POSITION;

        if (guillermo.orientation == pos.orientation) return Abad.ACT_POSITION.CORRECT;

        return Abad.ACT_POSITION.BAD_NOT_IN_POSITION;
    }

    checkMonksIn(placeId) {
        
        let monksChecked = Abad.MONKS_IN_REFECTORY;

        if (placeId == Abad.ACT_PLACE.CHURCH) {
            monksChecked = (this.scene.logic.timeOfDay == GameLogic.TIME_OF_DAY.VISPERAS) ? Abad.MONKS_IN_CHURCH_VISPERAS : Abad.MONKS_IN_CHURCH_PRIMA;
        }

        for (const monkId of monksChecked[this.scene.logic.day - 1]) {
            if (this.scene.actors[monkId].reached != placeId) return false;
        }

        return true;
    }

}

export default Abad;