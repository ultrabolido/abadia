import { FLOOR } from '../constants';

class AbadiaCamera {

    constructor(scene) {
        this.scene = scene;
        this.actor = null;
        this.orientation = 0;
        this.currentRoom = {};
        this.currentFloor = null;
        this.illuminatedRoom = true;
    }

    reset() {

        this.follow(this.actor, true);

    }

    follow(actor, force = false) {

        if (force) this.actor = null;
        if (this.actor === actor) return;

        if (this.actor) this.actor.events.off('changeRoom');
        this.actor = actor;
        this.actor.events.on('changeRoom', this.changeRoom, this);
        this.changeRoom(this.actor.floor, this.actor.room.x, this.actor.room.y);

    }

    showRoom(floor, x, y) {

        if (this.scene.abadiaBuilder.getRoom(floor, x, y) == 0) return;

        if (this.actor) this.actor.events.off('changeRoom');
        this.actor = null;
        this.changeRoom(floor, x, y);
    }

    changeRoom(fl, x, y) {
        
        if (this.currentFloor == fl && this.currentRoom.x == x && this.currentRoom.y == y) return;
        
        if (this.scene.abadiaBuilder.getRoom(fl, x, y) == 0) {
            if (this.actor) this.actor.events.off('changeRoom');
            this.actor = null;

            return;
        } 

        this.currentRoom.x = x;
        this.currentRoom.y = y;
        this.currentFloor = fl;
        this.scene.abadiaBuilder.buildRoom(this.currentFloor, this.currentRoom.x, this.currentRoom.y);
        this.orientation = (( this.currentRoom.x & 0x01) << 1) | ((this.currentRoom.x & 0x01) ^ (this.currentRoom.y & 0x01));

        this.illuminatedRoom = this.checkIlluminatedRoom();
        this.scene.updateEntitiesVisibility();
        
    }

    checkIlluminatedRoom() {

        if (this.currentFloor == FLOOR.LIBRARY) {

            if (this.currentRoom.x == 1) return true;
            if (this.currentRoom.x == 2 && this.currentRoom.y == 6) return true;

            return false;

        }

        return true;
    }

    adjustOrientation(orientation) {
        return (orientation - this.orientation) & 0x03;
    }

    adjustPosition(pos) {
        
        let temp;
        let adjustedPosition = { ...pos};

        switch (this.orientation) {
            case 0:
                break;
            case 1:
                temp = pos.y;
                adjustedPosition.y = pos.x;
                adjustedPosition.x = 40 - temp;
                break;
            case 2:
                adjustedPosition.x = 40 - pos.x;
                adjustedPosition.y = 40 - pos.y;
                break;
            case 3:
                temp = pos.x;
                adjustedPosition.x = pos.y;
                adjustedPosition.y = 40 - temp;
                break;
        }

        return adjustedPosition;
    }
}

export default AbadiaCamera;