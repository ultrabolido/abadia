import { SCREEN_OFFSET_X, ORIENTATION, FLOOR } from "../constants";

class Entity {

    constructor(scene, config, spriteName) {
        this.scene = scene;
      
        this.position = config.position ? { x: config.position.x, y: config.position.y } : { x: 0, y: 0 };
        this.room = config.room ? { x: config.room.x, y: config.room.y } : { x: 0, y: 0 };
        this.floor = config.floor || FLOOR.MAIN;
        this.orientation = config.orientation || ORIENTATION.SOUTH_EAST;
        this.height = config.height || 0;

        this.spriteName = spriteName;

        this.posLocal = { x: this.position.x + 12, y: this.position.y + 12 };

        this.sprite = scene.add.sprite(0, 0).setOrigin(0,0);
        this.sprite.setVisible(false);
    
    }

    draw() {
        
        this.updateVisibility();

        if (this.sprite.visible) {
            
            this.updateSpriteFrame();
            this.updateSpritePosition();

        }
    }

    isVisibleInRoom(floor, roomX, roomY) {
        this.posLocal.x = ((this.room.x << 4) | this.position.x ) - (roomX << 4) + 12;
        this.posLocal.y = ((this.room.y << 4) | this.position.y ) - (roomY << 4) + 12; 
        
        return (this.floor == floor) && 
               (this.posLocal.x > 0) && (this.posLocal.x <= 40 ) &&
               (this.posLocal.y > 0) && (this.posLocal.y <= 40 );
    }

    isVisibleInCurrentRoom() {
        return this.isVisibleInRoom(this.scene.camera.currentFloor, this.scene.camera.currentRoom.x, this.scene.camera.currentRoom.y );
    }

    updateVisibility() {

        this.sprite.setVisible(this.isVisibleInCurrentRoom());
    }

    resetTexture() {
        const time = this.scene.logic.isNight() ? "night" : "day";
        this.sprite.setTexture(`${this.spriteName}_${time}`);
        this.updateSpriteFrame();
    }

    updateSpritePosition() {
        
        const adjustedPosition = this.scene.camera.adjustPosition(this.posLocal);

        this.sprite.x += 120 + ( adjustedPosition.x  - adjustedPosition.y ) * 8;
        this.sprite.y += -98 + ( adjustedPosition.x  + adjustedPosition.y - this.height + 1 ) * 4;

        this.sprite.x += SCREEN_OFFSET_X;

        this.sprite.setDepth(this.sprite.depth + adjustedPosition.x + adjustedPosition.y - 16);

        this.reOrderTiles(adjustedPosition);
    
    }

    hide() {
        this.sprite.setVisible(false);
    }

    distanceX(actor) {
        return ((actor.room.x << 4) | actor.position.x) - ((this.room.x << 4) | this.position.x);
    }

    distanceY(actor) {
        return ((actor.room.y << 4) | actor.position.y) - ((this.room.y << 4) | this.position.y);
    }

    reOrderTiles(position) {
        this.scene.abadiaBuilder.reOrderTiles(this.sprite, position);
    }

    getTerrainHeight(vector) {
        return this.scene.abadiaBuilder.getHeight(
            this.floor,
            this.room.x,
            this.room.y,
            this.position.x + vector.x, 
            this.position.y + vector.y
        );
    }

    setPosition(pos) {
    
        this.room.x = pos.room.x;
        this.room.y = pos.room.y;
        this.position.x = pos.position.x;
        this.position.y = pos.position.y;
        this.floor = pos.floor;
        this.height = pos.height;
        this.orientation = pos.orientation;

    }
   
}

export default Entity;