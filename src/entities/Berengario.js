import Monk from './Monk';
import Item from './Item';
import GameLogic from '../logic/GameLogic';
import { ORIENTATION, FLOOR, TICK_TIME } from '../constants';

class Berengario extends Monk {
    constructor(scene, config) {
        super(scene, config, 'berengario');
        this.initDefaultPositions();

        this.advisedAbad = false;
        this.tags['goToAbad'] = false;

        this.phrase0x35 = false;
        this.phrase0x36 = false;

    }

    initDefaultPositions() {
        this.defaultPositions = [
            { floor: FLOOR.MAIN, room: { x: 8, y: 4 }, position: { x: 12, y: 8}, orientation: ORIENTATION.NORTH_EAST, height: 2 }, // church
            { floor: FLOOR.MAIN, room: { x: 3, y: 3 }, position: { x: 2, y: 5}, orientation: ORIENTATION.SOUTH_WEST, height: 2 },  // refectory
            { floor: FLOOR.SCRIPTORIUM, room: { x: 3, y: 5 }, position: { x: 13, y: 12}, orientation: ORIENTATION.NORTH_WEST, height: 4 },  // scriptorium
            { floor: FLOOR.MAIN, room: { x: 11, y: 1 }, position: { x: 12, y: 5}, orientation: ORIENTATION.SOUTH_EAST, height: 2 },  // monk's cell
            { floor: FLOOR.MAIN, room: { x: 5, y: 6 }, position: { x: 2, y: 7}, orientation: ORIENTATION.NORTH_EAST, height: 4 },  // stairs to scriptorium
            { floor: FLOOR.MAIN, room: { x: 6, y: 5 }, position: { x: 8, y: 7}, orientation: ORIENTATION.NORTH_EAST, height: 2 }  // severino's cell
        ];
    }

    think() {

        const day = this.scene.logic.day;
        const timeOfDay = this.scene.logic.timeOfDay;
        const guillermo = this.scene.guillermo;

        if (timeOfDay == GameLogic.TIME_OF_DAY.SEXTA) {
            this.target = 1;

            return;
        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.PRIMA) {
            this.target = 0;

            return;
        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.COMPLETAS) {
            this.target = 3;

            return;
        }

        
        if (timeOfDay == GameLogic.TIME_OF_DAY.NOCHE) {
            
            if (day == 3) {

                if (this.state == 6) {
                    this.authItems.add(Item.BOOK);

                    if (this.reached == 3) {
                        this.target = 4;
                    } else {

                        this.target = Monk.TARGET.BOOK;

                        if (this.inventory.has(Item.BOOK)) {

                            if (this.reached == 5) {
                                this.inactive();
                                this.scene.logic.advanceTimeOfDay = true;
                            }

                            this.target = 5;
                        }
                    }

                    return;
                }

                if (this.reached == 3) {
                    this.setHood();
                    this.state = 6;

                    return;
                }
                
            
            }

            this.target = 3;

            return;
        }

        if (timeOfDay == GameLogic.TIME_OF_DAY.VISPERAS) {
            
            if ((day == 2) && (this.scene.malaquias.state < 4)) {
                this.searchPath = false;
            } else {
                this.state = 1;
                this.target = 0;
            }

            return;
        }

        if (day < 3) {

            if (this.state == 4) {

                if (!this.tags['goToAbad'] && guillermo.room.x == 3 && guillermo.room.y == 5) {
                    if (!guillermo.inventory.has(Item.SCROLL)) {
                        this.state = 0;
                        this.removeTagEvent('goToAbad');
                    }
                } else {
                    this.state = 5;
                    this.scene.logic.removeTimeOfDayEvent();
                }

                return;
            }

            if (this.state == 5) {

                this.target = Monk.TARGET.ABAD;

                if (this.reached == Monk.TARGET.ABAD) {

                    this.state = 0;

                    this.scene.abad.guillermoHasTheScroll = true;
                    this.advisedAbad = true;

                }

                return;

            }

            if (this.reached == 2) {

                if (!this.advisedAbad && guillermo.inventory.has(Item.SCROLL)) {

                    this.state = 4;
                    this.addTagEvent('goToAbad', 0x42 * TICK_TIME);

                    if (this.isCloseTo(guillermo)) {
                        this.scene.board.showPhrase(0x04);
                    } else {
                        this.state = 5;
                        this.scene.logic.removeTimeOfDayEvent();
                    }

                    return;
                }
            
            }

            if (this.scene.malaquias.phrase0x34 && guillermo.floor > 0) {

                if (!this.phrase0x35) {

                    this.target = Monk.TARGET.GUILLERMO;

                    if (this.isCloseTo(guillermo)) {

                        if (!this.scene.board.displayingPhrase()) {

                            this.reached = Monk.TARGET.GUILLERMO;

                            this.resetActions();
                            this.phrase0x35 = true;

                            this.scene.board.showPhrase(0x35);
                            this.searchPath = false;

                        }
                    }

                    return;
                }

                if (!this.phrase0x36) {

                    this.target = 2;

                    if (this.isCloseTo(guillermo)) {

                        if (this.reached == 2 && !this.scene.board.displayingPhrase()) {

                            this.phrase0x36 = true;
                            this.scene.board.showPhrase(0x36);
                        }

                        return;
                    }

                }

            }

            this.state = 0;
            this.target = 2;
        }
    }

    setHood() {
        this.spriteName = 'hooded';
        this.resetTexture();
    }

}



export default Berengario;