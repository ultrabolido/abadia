import Monk from './Monk';
import GameLogic from '../logic/GameLogic';
import { ORIENTATION, FLOOR } from '../constants';
import Item from './Item';

class Bernardo extends Monk {
    constructor(scene, config) {
        super(scene, config, 'bernardo');
        this.initDefaultPositions();
    }

    initDefaultPositions() {
        this.defaultPositions = [
            { floor: FLOOR.MAIN, room: { x: 8, y: 4 }, position: { x: 12, y: 8}, orientation: ORIENTATION.NORTH_EAST, height: 2 }, // church
            { floor: FLOOR.MAIN, room: { x: 3, y: 3 }, position: { x: 2, y: 5}, orientation: ORIENTATION.SOUTH_WEST, height: 2 },  // refectory
            { floor: FLOOR.SCRIPTORIUM, room: { x: 3, y: 5 }, position: { x: 13, y: 12}, orientation: ORIENTATION.NORTH_WEST, height: 2 },  // scriptorium table
            { floor: FLOOR.MAIN, room: { x: 11, y: 1 }, position: { x: 12, y: 5}, orientation: ORIENTATION.SOUTH_EAST, height: 2 },  // monk's cell
            { floor: FLOOR.MAIN, room: { x: 8, y: 10 }, position: { x: 8, y: 8}, orientation: ORIENTATION.SOUTH_WEST, height: 0 }  // abbey exit
        ];
    }

    think() {

        if (this.scene.logic.timeOfDay == GameLogic.TIME_OF_DAY.SEXTA) {
            this.target = 1;

            return;
        }

        if (this.scene.logic.timeOfDay == GameLogic.TIME_OF_DAY.PRIMA) {
            this.target = 0;

            return;
        }

        if (this.scene.logic.day == 5) {

            if (this.reached == 4) {
                this.inactive();
            }

            this.target = 4;
        }

        if (this.scene.logic.timeOfDay == GameLogic.TIME_OF_DAY.NOCHE || this.scene.logic.timeOfDay == GameLogic.TIME_OF_DAY.COMPLETAS) {
            this.target = 3;

            return;
        }

        if (this.scene.logic.timeOfDay == GameLogic.TIME_OF_DAY.VISPERAS) {
            this.target = 0;

            return;
        }

        if (this.state == 0x14) {

            if (this.target == this.reached) {
                this.target = Math.floor(Math.random() * 4);
            }

            return;
        }

        if (this.scene.logic.day == 4) {

            if (this.target == Monk.TARGET.ABAD && this.scene.abad.inventory.has(Item.SCROLL)) {
                this.state = 0x14;

                this.target = 1;

                this.scene.abad.state = 0x15;

                return;
            }
        }

        if (this.inventory.has(Item.SCROLL)) {
            this.target = Monk.TARGET.ABAD;

            this.authItems.clear();

            return;
        }

        if (this.scene.logic.savedScroll || this.scene.abad.inventory.has(Item.SCROLL) || this.scene.abad.state == 0x0B) {
            this.target = 2;
            this.state = 0x14;

            return;
        }

        this.scene.logic.savedScroll = false;

        this.scene.logic.removeTimeOfDayEvent();

        if (this.scene.guillermo.inventory.has(Item.SCROLL)) {

            if (this.state == 7) {

                this.target = Monk.TARGET.GUILLERMO;

                if (this.isCloseTo(this.scene.guillermo)) {
                
                    if (!this.scene.board.displayingPhrase()) {
                        this.scene.board.showPhrase(0x05);
                        this.scene.logic.decrementObsequium(2);
                    }

                }

            } else {
                if (this.isCloseTo(this.scene.guillermo)) {
                    this.target = 3;
                } else {
                    this.state = 7;
                }
            }

        } else {

            this.target = Monk.TARGET.SCROLL;

        }

    }

}



export default Bernardo;