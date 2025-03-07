import Monk from './Monk';
import GameLogic from '../logic/GameLogic';
import { ORIENTATION, FLOOR, TICK_TIME } from '../constants';
import Item from './Item';

class Jorge extends Monk {
    constructor(scene, config) {
        super(scene, config, 'jorge');
        this.initDefaultPositions();

        this.tags['jorgeFlees'] = false;
    }

    initDefaultPositions() {
        this.defaultPositions = [
            { floor: FLOOR.MAIN, room: { x: 11, y: 1 }, position: { x: 12, y: 5}, orientation: ORIENTATION.SOUTH_EAST, height: 2 }, // monk's cell
            { floor: FLOOR.LIBRARY, room: { x: 1, y: 2 }, position: { x: 9, y: 11}, orientation: ORIENTATION.SOUTH_EAST, height: 6 }  // Laberinth room
        ];
    }

    think() {

        if (this.scene.logic.day == 3) {

            if (this.scene.logic.timeOfDay == GameLogic.TIME_OF_DAY.PRIMA) {

                this.searchPath = false;

                return;
            }

            if (this.scene.logic.timeOfDay == GameLogic.TIME_OF_DAY.TERCIA) {

                this.searchPath = false;

                if (this.state == 0x1E) {

                    if (!this.scene.board.displayingPhrase()) {
                        this.state = 0x1F;
                    }

                    return;
                }

                if (this.state == 0x1F) {

                    if (this.isCloseTo(this.scene.guillermo)) {
                        this.scene.board.showPhrase(0x32);

                        this.scene.logic.advanceTimeOfDay = true;
                    }

                    return;
                }

                if (this.isCloseTo(this.scene.guillermo)) {
                    this.scene.board.showPhrase(0x31, true);

                    this.state = 0x1E;
                }

                return;
            }

            if (this.scene.logic.timeOfDay == GameLogic.TIME_OF_DAY.SEXTA) {
                this.target = 0;
                this.state = 0;

                if (this.reached == 0) {
                    this.isActive = false;
                }

                return;
            }

        }

        if (this.scene.logic.day >= 6) {

            if (this.state == 0x0B) {

                if (!this.scene.board.displayingPhrase()) {

                    this.leaveItem(Item.BOOK);

                    this.state = 0x0C;
                }

                this.searchPath = false;

                return;
            }

            if (this.state == 0x0C) {

                if (this.scene.guillermo.inventory.has(Item.BOOK)) {

                    this.scene.board.showPhrase(0x2E);

                    this.state = 0x0D;
                }

                this.searchPath = false;

                return;

            }

            if (this.state == 0x0D) {

                if (!this.scene.guillermo.inventory.has(Item.GLOVES)) {

                    if (!this.scene.logic.gameOver) {

                        if (this.scene.camera.currentRoom.x == 2 || !this.scene.board.displayingPhrase()) {
  
                            this.scene.guillermo.poisoned();

                        } else {

                            this.removeTagEvent('guillermoPoisoned');

                        }
                    }

                    this.searchPath = false;

                } else {

                    if (!this.scene.board.displayingPhrase()) {

                        this.scene.board.showPhrase(0x23);
                        this.state = 0x0E;

                    }

                    this.searchPath = false;

                }

                return;

            }

            if (this.state == 0x0E) {

                if (!this.scene.board.displayingPhrase()) {

                    this.state = 0x0F;
                    this.scene.board.showPhrase(0x2F);

                }

                this.searchPath = false;
                return;
            }

            if (this.state == 0x0F) {

                this.addTagEvent('jorgeFlees', 0x28 * TICK_TIME);

                if (this.tags['jorgeFlees']) {

                    this.scene.camera.illuminatedRoom = false;

                    this.target = 1;

                    this.scene.guillermo.inventory.delete(Item.BOOK);
                    this.scene.items[Item.BOOK].hidden = true;

                    this.scene.board.updateObjects();

                    this.state = 0x10;

                } else {

                    this.searchPath = false;

                }

                return;
            }

            if (this.state == 0x10) {

                if (this.reached == 1 && this.scene.camera.currentRoom.x == 1 && this.scene.camera.currentRoom.y == 2 && 
                    this.scene.camera.currentFloor == FLOOR.LIBRARY && this.scene.guillermo.height < 6) {

                        this.scene.logic.gameOver = true;
                        this.scene.logic.success = true;
                        this.isActive = false;
                        this.scene.board.showPhrase(0x24);

                    }

                return;

            }

            if (this.scene.camera.currentRoom.x == 1 && this.scene.camera.currentRoom.y == 6 && this.scene.camera.currentFloor == FLOOR.LIBRARY) {

                this.scene.board.showPhrase(0x21, true);

                this.state = 0x0B;

            }

            this.searchPath = false;
        }

    }

}

export default Jorge;