import Monk from './Monk';
import GameLogic from '../logic/GameLogic';
import { ORIENTATION, FLOOR } from '../constants';

class Severino extends Monk {
    constructor(scene, config) {
        super(scene, config, 'severino');
        this.initDefaultPositions();

        this.hasPresentedGuillermo = false;
        this.hasMeetGuillermo = false;
        this.guillermoInLeftWing = false;
    }

    initDefaultPositions() {
        this.defaultPositions = [
            { floor: FLOOR.MAIN, room: { x: 8, y: 4 }, position: { x: 12, y: 11}, orientation: ORIENTATION.NORTH_EAST, height: 2 }, // church
            { floor: FLOOR.MAIN, room: { x: 3, y: 3 }, position: { x: 6, y: 5}, orientation: ORIENTATION.SOUTH_WEST, height: 2 },  // refectory
            { floor: FLOOR.MAIN, room: { x: 6, y: 5 }, position: { x: 8, y: 5}, orientation: ORIENTATION.SOUTH_EAST, height: 2 },  // severino's cell
            { floor: FLOOR.MAIN, room: { x: 12, y: 2 }, position: { x: 9, y: 10}, orientation: ORIENTATION.SOUTH_EAST, height: 0 }  // near monk's cell
        ];
    }

    think() {

        switch (this.scene.logic.timeOfDay) {

            case GameLogic.TIME_OF_DAY.COMPLETAS:
            case GameLogic.TIME_OF_DAY.NOCHE:
                this.target = 2;
                this.reached = 2;
                break;

            case GameLogic.TIME_OF_DAY.PRIMA:
                if (this.scene.board.displayingPhrase() && this.target == Monk.TARGET.GUILLERMO) return;
                this.target = 0;

                if (this.scene.logic.day == 5 && !this.guillermoInLeftWing) {

                    if (this.scene.guillermo.room.x < 6) {
                        this.guillermoInLeftWing = true;
                    } else {
                        this.target = Monk.TARGET.GUILLERMO;

                        if (this.reached == Monk.TARGET.GUILLERMO) {
                            this.scene.board.showPhrase(0x0F, true);
                            this.guillermoInLeftWing = true;
                        }
                    }
                }
                break;
            
            case GameLogic.TIME_OF_DAY.SEXTA:
                this.target = 1;
                break;

            case GameLogic.TIME_OF_DAY.TERCIA:
            case GameLogic.TIME_OF_DAY.NONA:

                if (!this.hasPresentedGuillermo && (this.reached >= 2 || this.reached == Monk.TARGET.GUILLERMO) && this.scene.logic.day >= 2 && this.scene.abad.target != Monk.TARGET.GUILLERMO) {

                    if (!this.hasMeetGuillermo && !this.scene.board.displayingPhrase()) {

                        if (this.isCloseTo(this.scene.guillermo)) {
                            this.hasMeetGuillermo = true;
                            this.target = Monk.TARGET.GUILLERMO;

                            this.scene.board.showPhrase(0x37);

                            return;
                        }
                    }

                    if (this.hasMeetGuillermo) {

                        this.target = Monk.TARGET.GUILLERMO;

                        if (!this.scene.board.displayingPhrase()) {

                            this.target = 2;
                            this.reached = 3;
                            this.hasPresentedGuillermo = true;
                        }

                        return;
                    }

                }

                if (this.reached == Monk.TARGET.GUILLERMO) {

                    if (!this.scene.board.displayingPhrase()) {

                        this.scene.board.showPhrase(0x26);

                        this.scene.logic.advanceTimeOfDay = true;
                    }

                    return;
                }

                if (this.reached == 2 ) {

                    if (this.scene.logic.day == 5) {
                        this.searchPath = false;

                        return;
                    }

                    if (this.scene.logic.day == 4 && this.scene.logic.timeOfDay == GameLogic.TIME_OF_DAY.TERCIA) {
                        this.target = Monk.TARGET.GUILLERMO;

                        if (this.isCloseTo(this.scene.guillermo)) {
                            this.scene.board.showPhrase(0x2C);
                        }

                        return;
                    }

                    this.target = 3;

                    return;
                } 
                this.target = 2;
                break;

            default:
                this.target = 0;
                
        }
    }

}



export default Severino;