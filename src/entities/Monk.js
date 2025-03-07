import Actor from './Actor';
import Adso from './Adso';
import Door from './Door';
import Item from './Item';
import Pathfinder from '../logic/Pathfinder';

class Monk extends Actor {

    static TARGET = {
        VOID: -1,
        GUILLERMO: -2,
        ABAD: -3,
        BOOK: -4,
        SCROLL: -5
    }

    constructor(scene, config, sprite) {
        super(scene, config, sprite);
        
        this.pathfinder = new Pathfinder(scene.abadiaBuilder);
        this.findPath = true;
        this.target = Monk.TARGET.VOID;
        this.reached = Monk.TARGET.VOID;
        this.defaultPositions = [];

        this.searchPath = true;
        
        this.actions = [];

        this.state = 0;
        
    }

    update() {

        if (!this.isActive) return;
        
        this.searchPath = true;

        this.think();
        this.updateDoorPath();
        this.move();
        super.update();
        this.updatePathfinding();
        
    }

    think() {

    }

    updateDoorPath() {
        for (let i = 0; i < 6; i++) {
            
            const door = this.scene.doors[i];
            let locked = door.locked;

            if ((this instanceof Adso) && ( door.id == Door.PASSAGE )) {
    
                locked = !this.scene.doors[i].isOpen;

            }
            
            if (!locked && this.pathDoors.has(door.id)) {

                this.scene.abadiaBuilder.openDoorPath(i);

            } else {

                this.scene.abadiaBuilder.closeDoorPath(i);

            }
        }
    }

    move() {
        
        if (!this.inWaitingFrame()) return;

        if (!this.movementPossible) this.resetActions();

        this.moreActions = (this.actions.length > 0);

        if (this.moreActions) {

            let action = this.actions[0];
            if (this.doubleMotion) this.actionExecuted(action);

            if (action) {

                this.performAction(action.action);
                this.actionExecuted(action);

            }

        } 

    }

    updatePathfinding() {
        
        // FIXME: return if a path solution is already found in this game loop. Probably solves infinite collisions paths between monks
        
        if (!this.inWaitingFrame()) return;
        if (!this.searchPath) return;
        if (this.moreActions) return;


        let targetPosition;
        
        switch (this.target) {
            case Monk.TARGET.VOID: targetPosition = null; break;
            case Monk.TARGET.GUILLERMO: targetPosition = this.scene.guillermo; break;
            case Monk.TARGET.ABAD: targetPosition = this.scene.abad; break;
            case Monk.TARGET.BOOK: targetPosition = this.scene.items[Item.BOOK]; break;
            case Monk.TARGET.SCROLL: targetPosition = this.scene.items[Item.SCROLL]; break;

            default: targetPosition = this.defaultPositions[this.target];
        }

        if (!targetPosition) return;

        this.updateActorHeight(0);
        const { reached, actions } = this.pathfinder.findPath(this, targetPosition);
        this.updateActorHeight(this.heightMarkValue);
        this.actions = actions;
        
        if (reached) this.reached = this.target;
        
    }

    resetActions() {
        this.actions = [];
    }
    
    actionExecuted(action) {
        action.times--;
        if (action.times == 0) this.actions.shift();
        this.doubleMotion = false;
    }

    setPosition(pos) {
        if (typeof pos === 'number') pos = this.defaultPositions[pos];

        super.setPosition(pos);
    }

}

export default Monk;