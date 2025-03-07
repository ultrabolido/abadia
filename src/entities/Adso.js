import Monk from './Monk';
import Actor from './Actor';
import Item from './Item';
import Guillermo from './Guillermo';
import { ORIENTATION, FLOOR, TICK_TIME } from '../constants';
import GameLogic from '../logic/GameLogic';

class Adso extends Monk {
    
    static GET_AWAY_ORIENTATION = [
        [ 3, 0, 2, 1 ],
        [ 0, 3, 1, 2 ],
        [ 1, 0, 2, 3 ],
        [ 0, 1, 3, 2 ],
        [ 3, 2, 0, 1 ],
        [ 2, 3, 1, 0 ],
        [ 1, 2, 0, 3 ],
        [ 2, 1, 3, 0 ]
    ];
    
    constructor(scene, config) {
        super(scene, config, 'adso');
        this.heightMarkValue = 0x20;
        this.frustrated = 0;

        this.initControls();
        this.initDefaultPositions();

        this.tags['guillermoSleep'] = false;
        this.tags['walkingInTheDark'] = false;

        this.dawnAdvised = false;
        this.lampRunningOutAdvised = false;
        this.lampExhausted = false;
        this.inTheDark = false;
    }

    initControls() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
    }

    initDefaultPositions() {
        this.defaultPositions = [
            { floor: FLOOR.MAIN, room: { x: 8, y: 4 }, position: { x: 4, y: 14}, orientation: ORIENTATION.NORTH_EAST, height: 2 },
            { floor: FLOOR.MAIN, room: { x: 3, y: 3 }, position: { x: 4, y: 9}, orientation: ORIENTATION.NORTH_EAST, height: 2 },
            { floor: FLOOR.MAIN, room: { x: 10, y: 1 }, position: { x: 8, y: 8}, orientation: ORIENTATION.NORTH_EAST, height: 2 }
        ];
    }

    updateSpritePosition() {
        super.updateSpritePosition();
        this.sprite.y += 2;
    }

    think() {

        let newState;
        let phraseId;

        if (this.scene.logic.itsDawn() && !this.dawnAdvised) {

            this.dawnAdvised = true;
            this.scene.board.showPhrase(0x27);

        }

        if (this.scene.lamp.timeUsed() > 0.5 && !this.lampRunningOutAdvised) {

            this.lampRunningOutAdvised = true;
            this.scene.board.showPhrase(0x28, true);

        }

        if (this.lampExhausted) {

            this.lampExhausted = false;
            this.scene.board.showPhrase(0x2A, true);
            this.addTagEvent('walkingInTheDark', 0x32 * TICK_TIME);
            this.inTheDark = true;

        }

        if (!this.scene.logic.gameOver) {

            if (this.inTheDark) {

                if (this.scene.guillermo.floor < FLOOR.LIBRARY) {

                    this.inTheDark = false;
                    this.removeTagEvent('walkingInTheDark');

                    return;
                }

                if (this.tags['walkingInTheDark']) {

                    this.scene.logic.gameOver = true;
                    this.scene.guillermo.alive = false;
                    this.scene.board.showPhrase(0x2B, true);

                    return;
                }

            } else {

                if (this.floor == FLOOR.LIBRARY) {

                    this.target = Monk.TARGET.GUILLERMO;

                    if (!this.inventory.has(Item.LAMP)) {

                        this.scene.board.showPhrase(0x13, true);
                        this.inTheDark = true;
                        this.addTagEvent('walkingInTheDark', 0x64 * TICK_TIME);

                        return;
                    }

                } else {

                    this.removeTagEvent('walkingInTheDark');

                }

            }

        }

        switch (this.scene.logic.timeOfDay) {

            case GameLogic.TIME_OF_DAY.VISPERAS:
            case GameLogic.TIME_OF_DAY.PRIMA:
                this.target = 0;
                newState = 1;
                phraseId = 0x0B;
                this.dawnAdvised = false;
                break;
            
            case GameLogic.TIME_OF_DAY.SEXTA:
                this.target = 1;
                newState = 7;
                phraseId = 0x0C;
                break;

            case GameLogic.TIME_OF_DAY.COMPLETAS:
                this.target = 2;
                this.state = 6;
                return;

            case GameLogic.TIME_OF_DAY.NOCHE:
                if (this.state == 4) {

                    if (this.scene.camera.currentRoom.x == 10 && this.scene.camera.currentRoom.y == 2) {

                        this.scene.logic.advanceTimeOfDay = true;
                        this.scene.board.removeYesNo();

                    }

                    if (!this.scene.board.displayingPhrase()) {

                        if (this.tags['guillermoSleep']) {
                       
                            this.scene.logic.advanceTimeOfDay = true;
                            this.scene.board.removeYesNo();
                       
                        }                        

                    }

                    return;

                } else {

                    this.target = Monk.TARGET.GUILLERMO;

                    if (this.state == 5) {

                        if (this.scene.camera.currentRoom.x == 10 && this.scene.camera.currentRoom.y == 1) return;
                        this.state = 6;

                    }

                    if (this.state == 6) {

                        if (this.isCloseTo(this.scene.guillermo) && this.scene.camera.currentRoom.x == 10 && this.scene.camera.currentRoom.y == 1) {

                            this.removeTagEvent('guillermoSleep');
                            this.addTagEvent('guillermoSleep', 100 * TICK_TIME);
                            this.state = 4;
                            this.scene.board.showPhrase(0x12);
                        }

                        return;
                    }
                }

                break;
            
            default:
                this.target = Monk.TARGET.GUILLERMO;
                return;
                
        }

        if (newState != this.state) {
            
            if (this.isCloseTo(this.scene.guillermo)) this.scene.board.showPhrase(phraseId);

        }
        this.state = newState;
    }

    updatePathfinding() {
        if (this.target != Monk.TARGET.GUILLERMO) {
            
            super.updatePathfinding();

        } else {

            if (!this.inWaitingFrame()) return;
            if (!this.searchPath) return;
            if (this.moreActions) return;
            
            if (!(this.scene.camera.actor instanceof Adso) && !(this.scene.camera.actor instanceof Guillermo)) return;

            const guillermo = this.scene.guillermo;

            if (this.isVisibleInRoom(guillermo.floor, guillermo.room.x, guillermo.room.y)) {            

                if (this.cursors.up.isDown) {

                    const collisionVectors = 
                    guillermo.onStairs ? Actor.COLLISION_CHECK_VECTORS_ON_STAIRS[guillermo.orientation] : Actor.COLLISION_CHECK_VECTORS[guillermo.orientation];

                    const height = guillermo.getTerrainHeight(collisionVectors[0]) | 
                                   guillermo.getTerrainHeight(collisionVectors[1]) |
                                   guillermo.getTerrainHeight(collisionVectors[2]) | 
                                   guillermo.getTerrainHeight(collisionVectors[3]);
                    
                    if ( (height & this.heightMarkValue) != 0) return this.freeGuillermo();
                }

                if (this.cursors.down.isDown) {
                    return this.followGuillermoCommands();
                }
                
                this.updateActorHeight(0);
                guillermo.updateActorHeight(0);

                const targetPosition = { 
                    floor: guillermo.floor,
                    room: guillermo.room,
                    position: guillermo.position,
                    orientation: guillermo.orientation,
                    height: guillermo.height
                }
                
                const result = this.pathfinder.findPath(this, targetPosition);
                const fullActions = result.actions;
            
                this.updateActorHeight(this.heightMarkValue);
                guillermo.updateActorHeight(guillermo.heightMarkValue);

                if (fullActions.length == 0) return;

                if ((this.room.x != guillermo.room.x) || (this.room.y != guillermo.room.y)) {

                    this.updateActorHeight(0);
                    guillermo.updateActorHeight(0);

                    const s = this.pathfinder.endDestination;
                    const start = { floor: this.floor, room : {x : s.roomX, y: s.roomY}, position : {x: s.tileX, y: s.tileY}, orientation: guillermo.orientation };
                    const result = this.pathfinder.findPath(start, targetPosition);
                    const moreActions = result.actions;

                    this.updateActorHeight(this.heightMarkValue);
                    guillermo.updateActorHeight(guillermo.heightMarkValue);
                    
                    fullActions.push(...moreActions);
                }

                const wc = this.walkCounts(fullActions);

                let maxWalkCounts = 4;

                if (!this.onStairs) {
                    maxWalkCounts--;

                    if ((this.position.x != guillermo.position.x) && (this.position.y != guillermo.position.y)) {
                        maxWalkCounts++;
                    }
                }

                if (wc >= maxWalkCounts) {

                    this.actions = this.reduceWalk(fullActions);
                    this.update();
                }

            } else {
                
                if (this.floor != guillermo.floor) {
                    if ((Math.abs(this.distanceX(this.scene.guillermo)) < 4) && (Math.abs(this.distanceY(this.scene.guillermo)) < 4)) return;
                }
                this.updateActorHeight(0);
                const result = this.pathfinder.findPath(this, guillermo);
                this.actions = result.actions;
                this.updateActorHeight(this.heightMarkValue);
                if (this.actions.length > 0) this.update();

            }

        }
    }

    walkCounts(actions) {
        let count = 0;
        actions.forEach( a => {
            if (a.action == Monk.Action.WALK) count += a.times;
        });
        return count;
    }

    reduceWalk(actions) {
        let i = 0;
        while (actions[i].action != Monk.Action.WALK) {
            if (actions[i].action == Monk.Action.STOP) {
                actions.splice(i, 1);
            } else {
                i++;
            }
        }
        actions[i].times = 1;
        
        return actions.slice(0, i + 1);
    }

    freeGuillermo() {

        this.updateActorHeight(0);
        
        let index = 0;

        let distX = this.scene.guillermo.distanceX(this);

        if (distX < 0) {
            distX = -distX;
            index |= 0x04;
        }

        let distY = this.scene.guillermo.distanceY(this);

        if (distY < 0) {
            distY = -distY;
            index |= 0x02;
        }

        if (distY < distX) {
            index++;
        }

        this.testMove(index);

    }

    followGuillermoCommands() {
        
        this.updateActorHeight(0);

        let index = this.scene.guillermo.orientation + 1;
        if (index == 3) index = 7;

        this.testMove(index);
    }

    testMove(index) {
        for (let i=0; i < 3; i++) {
            const orientation = Adso.GET_AWAY_ORIENTATION[index][i];
            const posX = this.position.x + Actor.MOVEMENT_VECTORS[orientation].x;
            const posY = this.position.y + Actor.MOVEMENT_VECTORS[orientation].y;

            const coords = this.scene.abadiaBuilder.normalizeCoordinates(this.room.x, this.room.y, posX, posY);

            const targetPosition = { 
                    floor: this.floor,
                    room: { x: coords.rx, y: coords.ry},
                    position: { x: coords.x, y: coords.y },
                    orientation: orientation,
                    height: this.height
                }
                
            const result = this.pathfinder.findPath(this, targetPosition, false);
            const fullActions = result.actions;

            if (fullActions.length > 0) {
                this.actions = this.reduceWalk(fullActions);
                this.updateActorHeight(this.heightMarkValue);
                this.update();
                break;
            };
        }

        this.updateActorHeight(this.heightMarkValue);
    }

    resetActions() {
        
        if (this.actions.length == 0) return;
        
        if (this.target != Monk.TARGET.GUILLERMO) {

            super.resetActions();

        } else {

            //Recover last action
            if (this.actions[0].action == Monk.Action.WALK) {

                this.actions[0].times++;

            } else {

                this.actions.unshift({ action: Monk.Action.WALK, times: 1 });

            }

            this.frustrated++;

            if (this.frustrated == 10) {
                
                this.frustrated = 0;
                super.resetActions();

            }
            
        }
    }

    guillermoAnswer(sleep) {

        if (this.scene.board.displayingPhrase()) return;
        if (this.state != 4) return;

        if (sleep) {
            this.scene.logic.advanceTimeOfDay = true;
        } else {
            this.state = 5; 
        }

        this.scene.board.removeYesNo();
    }

}

export default Adso;