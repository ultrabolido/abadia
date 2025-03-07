import { TICK_TIME, ORIENTATION, FLOOR } from '../constants';
import Door from '../entities/Door';
import Monk from '../entities/Monk';
import Item from '../entities/Item';

class GameLogic {

    static TIME_OF_DAY = {
        NOCHE: 0,
        PRIMA: 1,
        TERCIA: 2,
        SEXTA: 3,
        NONA: 4,
        VISPERAS: 5,
        COMPLETAS: 6
    }

    static BONUS = {
        GLOVES_IN_INVENTORY: 0,
        KEY1_IN_INVENTORY: 1,
        KEY2_IN_INVENTORY: 2,
        KEY3_IN_INVENTORY: 3,
        SCROLL_DAY3_NOCHE: 4,
        GLASSES_AND_SCROLL_IN_INVENTORY: 5,
        GUILLERMO_IN_ABAD_CELL: 6,
        LEFT_WING_NOCHE: 7,
        GUILLERMO_IN_LIBRARY: 8,
        GUILLERMO_IN_LIBRARY_WITH_GLASSES: 9,
        GUILLERMO_IN_LIBRARY_WITH_LAMP: 10,
        GUILLERMO_IN_MIRROR_ROOM: 11,
        GUILLERMO_BEHIND_THE_MIRROR_ROOM: 12,
        OPEN_MIRROR: 13
    }

    static DURATION = [
        [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ],
        [ 0x00, 0x00, 0x05, 0x00, 0x05, 0x00, 0x00 ],
        [ 0x00, 0x00, 0x05, 0x00, 0x05, 0x00, 0x00 ],
        [ 0x0f, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00 ],
        [ 0x0f, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00 ],
        [ 0x0f, 0x00, 0x05, 0x00, 0x05, 0x00, 0x00 ],
        [ 0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]
    ]

    constructor(scene) {
        this.scene = scene;

        this.bonus = new Set();

        this.day = 1;
        this.timeOfDay = GameLogic.TIME_OF_DAY.SEXTA;
        this.obsequium = 31;

        this.gameOver = false;
        this.success = false;
        this.advanceTimeOfDay = false;

        this.savedScroll = false;
        this.lampIsGone = true;

        this.romanNumber = Math.floor(Math.random() * 3);

        this.defaultCameraActor = null;

        this.mirrorClosed = true;

    }

    getCameraActor() {

        if ((this.scene.berengario.target == Monk.TARGET.BOOK && this.scene.berengario.room.x < 5 && this.scene.berengario.isActive) || this.scene.berengario.target == Monk.TARGET.ABAD) {

            return this.scene.berengario;

        }

        if (this.scene.bernardo.target == Monk.TARGET.ABAD) {

            return this.scene.bernardo;

        }
        
        if ((this.timeOfDay == GameLogic.TIME_OF_DAY.SEXTA && this.scene.abad.reached >= 2) || 
            this.scene.abad.state == 0x15 || this.scene.abad.guillermoHasTheScroll || this.scene.abad.state == 0x0B) {
              
            return this.scene.abad;
        }

        if ((this.scene.malaquias.target == Monk.TARGET.ABAD) || ((this.timeOfDay == GameLogic.TIME_OF_DAY.VISPERAS) && (this.scene.malaquias.state < 0x06))) {
            
            return this.scene.malaquias;
            
        }

        if (this.scene.severino.target == Monk.TARGET.GUILLERMO) {

            return this.scene.severino;

        }

        return this.defaultCameraActor;

    }

    updateTimeOfDay() {

        if (!this.scene.camera.actor?.inWaitingFrame()) return;

        if (this.scene.board.displayingPhrase()) return;

        if (this.advanceTimeOfDay) {
            this.advanceTime();
            this.executeTimeOfDayActions();
            this.advanceTimeOfDay = false;
        }
    }

    resetLamp() {

        if (!this.scene.malaquias.inventory.has(Item.LAMP) && this.scene.lamp.timeUsed() == 0) return;

        this.scene.lamp.reset();

        this.scene.adso.inventory.delete(Item.LAMP);
        this.scene.malaquias.inventory.delete(Item.LAMP);

        this.scene.adso.lampRunningOutAdvised = false;

        this.lampIsGone = true;
        this.scene.items[Item.LAMP].actor = null;
        this.scene.items[Item.LAMP].hidden = true;

    }


    executeTimeOfDayActions() {
        
        switch(this.timeOfDay) {

            case GameLogic.TIME_OF_DAY.NOCHE:
                if (this.day == 5) {

                    this.scene.items[Item.GLASSES].setPosition({ 
                        floor: FLOOR.LIBRARY, 
                        room: { x: 1, y: 2 }, 
                        position: { x: 11, y: 3}, 
                        orientation: ORIENTATION.SOUTH_EAST, 
                        height: 2 });

                    this.scene.items[Item.KEY1].setPosition({ 
                        floor: FLOOR.MAIN, 
                        room: { x: 8, y: 3 }, 
                        position: { x: 9, y: 14}, 
                        orientation: ORIENTATION.SOUTH_EAST, 
                        height: 8 });

                }

                if (this.day == 6) {
                    this.scene.items[Item.KEY2].setPosition({ 
                        floor: FLOOR.SCRIPTORIUM, 
                        room: { x: 3, y: 3 }, 
                        position: { x: 5, y: 5}, 
                        orientation: ORIENTATION.SOUTH_EAST, 
                        height: 8 });

                    this.scene.jorge.setPosition({ 
                        floor: FLOOR.LIBRARY, 
                        room: { x: 1, y: 6 }, 
                        position: { x: 2, y: 5}, 
                        orientation: ORIENTATION.SOUTH_WEST, 
                        height: 2 });

                    this.scene.jorge.isActive = true;
                }
                break;

            case GameLogic.TIME_OF_DAY.PRIMA:
                
                this.openAllDoors();
                this.scene.doors[Door.PASSAGE].locked = true;
                this.scene.doors[Door.BIG].fixed = true;
                this.scene.doors[Door.BIG + 1].fixed = true;

                if (this.day >= 3) {

                    this.resetLamp();

                    if (this.lampIsGone) {
                        this.lampIsGone = false;

                        this.scene.items[Item.LAMP].setPosition({ 
                            floor: FLOOR.MAIN, 
                            room: { x: 5, y: 2 }, 
                            position: { x: 10, y: 10}, 
                            orientation: ORIENTATION.SOUTH_EAST, 
                            height: 4 });

                    }
                }

                if (this.day == 2) {
                    this.scene.guillermo.inventory.delete(Item.GLASSES);
                    this.scene.berengario.inventory.delete(Item.GLASSES);
                    this.scene.items[Item.GLASSES].hidden = true;
                    this.scene.events.emit('updateobjects');
                }

                if (this.day == 3) {
                    this.scene.jorge.inventory.add(Item.BOOK);
                    this.scene.items[Item.BOOK].actor = this.scene.jorge;

                    this.scene.jorge.setPosition({ 
                        floor: FLOOR.MAIN, 
                        room: { x: 12, y: 2 }, 
                        position: { x: 8, y: 4}, 
                        orientation: ORIENTATION.SOUTH_EAST, 
                        height: 0 });

                    this.scene.jorge.isActive = true;

                    this.scene.abad.inventory.clear();

                    if (!this.scene.guillermo.inventory.has(Item.SCROLL)) {
                        
                        this.scene.items[Item.SCROLL].setPosition({ 
                            floor: FLOOR.LIBRARY, 
                            room: { x: 1, y: 6 }, 
                            position: { x: 8, y: 4}, 
                            orientation: ORIENTATION.SOUTH_EAST, 
                            height: 2 });

                        this.savedScroll = true;
                    }
                }

                if (this.day == 5 && !this.scene.guillermo.inventory.has(Item.KEY1)) {
                    this.scene.items[Item.KEY1].hidden = true;
                }
                break;

            case GameLogic.TIME_OF_DAY.COMPLETAS:
                this.openAllDoors();    
                this.scene.doors[Door.BIG].locked = true;
                this.scene.doors[Door.BIG + 1].locked = true;
                break;

            case GameLogic.TIME_OF_DAY.NONA:
                if (this.day == 3) {
                    this.scene.jorge.inactive();
                }
                break;

            case GameLogic.TIME_OF_DAY.SEXTA:
                if (this.day == 4) {
                    this.scene.bernardo.isActive = true;

                    this.scene.bernardo.setPosition({ 
                        floor: FLOOR.MAIN, 
                        room: { x: 8, y: 8 }, 
                        position: { x: 8, y: 8}, 
                        orientation: ORIENTATION.SOUTH_EAST, 
                        height: 2 });

                }
        }
    }

    openAllDoors() {
        this.scene.doors.forEach(door => {
            door.locked = false;
        });
    }

    decrementObsequium(num) {

        this.obsequium -= num;
        if (this.obsequium < 0) {
            
            if (!this.gameOver) this.scene.abad.state = 0x0B;
            this.obsequium = 0;
            
        }
        this.scene.events.emit('updateobsequium');
    }

    updateBonus() {

        if (this.scene.guillermo.inventory.has(Item.GLOVES)) this.bonus.add(GameLogic.BONUS.GLOVES_IN_INVENTORY);
        if (this.scene.guillermo.inventory.has(Item.KEY1)) this.bonus.add(GameLogic.BONUS.KEY1_IN_INVENTORY);
        if (this.scene.guillermo.inventory.has(Item.KEY2)) this.bonus.add(GameLogic.BONUS.KEY2_IN_INVENTORY);

        if (this.scene.adso.inventory.has(Item.KEY3)) this.bonus.add(GameLogic.BONUS.KEY3_IN_INVENTORY);

        if (this.scene.guillermo.inventory.has(Item.SCROLL)) {
            
            if (this.day == 3 && this.timeOfDay == GameLogic.TIME_OF_DAY.NOCHE) this.bonus.add(GameLogic.BONUS.SCROLL_DAY3_NOCHE);
            if (this.scene.guillermo.inventory.has(Item.GLASSES)) this.bonus.add(GameLogic.BONUS.GLASSES_AND_SCROLL_IN_INVENTORY);
            if (this.scene.guillermo.floor == FLOOR.MAIN && this.scene.guillermo.room.x == 5 && this.scene.guillermo.room.y == 3 ) this.bonus.add(GameLogic.BONUS.GUILLERMO_IN_ABAD_CELL);  

        }

        if (this.timeOfDay == GameLogic.TIME_OF_DAY.NOCHE && this.scene.guillermo.room.x < 6) this.bonus.add(GameLogic.BONUS.LEFT_WING_NOCHE);

        if (this.scene.guillermo.floor == FLOOR.LIBRARY) {

            if (this.scene.guillermo.inventory.has(Item.GLASSES)) this.bonus.add(GameLogic.BONUS.GUILLERMO_IN_LIBRARY_WITH_GLASSES);
            if (this.scene.adso.inventory.has(Item.LAMP)) this.bonus.add(GameLogic.BONUS.GUILLERMO_IN_LIBRARY_WITH_LAMP);
            if (!this.mirrorClosed) this.bonus.add(GameLogic.BONUS.OPEN_MIRROR);
            if (this.scene.guillermo.room.x == 1 && this.scene.guillermo.room.y == 6 ) this.bonus.add(GameLogic.BONUS.GUILLERMO_BEHIND_THE_MIRROR_ROOM);
            if (this.scene.guillermo.room.x == 2 && this.scene.guillermo.room.y == 6 ) this.bonus.add(GameLogic.BONUS.GUILLERMO_IN_MIRROR_ROOM);

            this.bonus.add(GameLogic.BONUS.GUILLERMO_IN_LIBRARY);
        }

    }

    calculatePercentage() {

        let percentage = 7 * (this.day - 1) + this.timeOfDay + (this.bonus.size * 4);
        if (percentage < 5 ) percentage = 0;

        return percentage;
    }

    advanceTime() {

        this.timeOfDay++;
        
        this.removeTimeOfDayEvent();

        if (this.timeOfDay > GameLogic.TIME_OF_DAY.COMPLETAS) {

            this.timeOfDay = GameLogic.TIME_OF_DAY.NOCHE;
            this.day++;

            if (this.day > 7) this.day = 1;
            this.scene.events.emit('updateday');
        }

        if (this.timeOfDay != GameLogic.TIME_OF_DAY.NOCHE) {

            if (this.timeOfDay == GameLogic.TIME_OF_DAY.PRIMA || this.timeOfDay == GameLogic.TIME_OF_DAY.VISPERAS || this.timeOfDay == GameLogic.TIME_OF_DAY.VISPERAS) {

                this.scene.sound.playAudioSprite('sound', 'bells');

            } else {

                this.scene.sound.playAudioSprite('sound', 'jingle');

            }

        }

        this.scene.events.emit('updatetimeofday');

        if (this.timeOfDay == GameLogic.TIME_OF_DAY.COMPLETAS || this.timeOfDay == GameLogic.TIME_OF_DAY.PRIMA) {
            this.scene.events.emit('changedaynight');
        }

        const duration = GameLogic.DURATION[this.day - 1][this.timeOfDay];
        if ( duration != 0) {

            this.timeOfDayEvent = this.scene.time.addEvent({ delay: duration * TICK_TIME * 256, callback: () => this.advanceTimeOfDay = true, callbackScope: this });
        
        }
    }

    removeTimeOfDayEvent() {
        if (this.timeOfDayEvent) this.timeOfDayEvent.destroy();
        this.timeOfDayEvent = null;
    }

    itsDawn() {
        if (this.timeOfDay != GameLogic.TIME_OF_DAY.NOCHE) return false;
        if (!this.timeOfDayEvent) return false;

        return this.timeOfDayEvent.getProgress() > 0.85;
    }

    isNight() {
        return this.timeOfDay == GameLogic.TIME_OF_DAY.COMPLETAS || this.timeOfDay == GameLogic.TIME_OF_DAY.NOCHE;
    }

    printTimeOfDay() {
        const timeOfDayTxt = ["NOCHE","PRIMA","TERCIA","SEXTA","NONA","VISPERAS","COMPLETAS"];
        return timeOfDayTxt[this.timeOfDay];
    }

}

export default GameLogic;