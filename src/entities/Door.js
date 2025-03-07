import { ORIENTATION } from "../constants";
import Entity from "./Entity";

class Door extends Entity {

    static ABAD_CELL = 0;
    static MONKS_CELL = 1;
    static SEVERINO_CELL = 2;
    static CHURCH_CELLS = 3;
    static PASSAGE = 4;
    static BIG = 5;

    static FRAME_OFFSET = [
        [ +2,  0,  0, -1, -1, -34, +1, +1,  0,  0, +1,  0 ],
        [  0, -4, -1, -1, -1, -42,  0,  0,  0,  0,  0, -1 ],
        [ -2,  0, -1,  0, -5, -42,  0, +1,  0,  0, -1,  0 ],
        [  0, +4,  0,  0, -5, -34, +1,  0, +1, +1,  0, +1 ]
    ];

    constructor(scene, config) {
        super(scene, config, 'doors');
        
        this.inward = config.inward;
        this.fixed = config.fixed || false;
        this.isOpen = config.open || false;
        this.id = config.id;
        this.locked = config.locked || false;

        this.resetTexture();
        this.updateSpritePosition();
    }

    update() {

        this.checkOpenClose();
        this.updateDoorHeight(0xF);
        
    }

    checkOpenClose() {

        if (this.fixed) return;

        if (!(this.id == Door.PASSAGE) && this.locked) return;

        for (let actor of this.scene.actors) {
            
            if (!actor.canOpenDoor(this.id)) continue;
            if (this.actorIsNear(actor)) return this.open()
        }

        this.close();
    }

    actorIsNear(actor) {

        const distX = this.distanceX(actor) + 1;
        if ((distX < 0) || (distX >= 4)) return false;

        const distY = this.distanceY(actor) + 1;
        if ((distY < 0) || (distY >= 4)) return false;

        return true;
    }

    updateSpriteFrame() {
        const orientationIndex = this.scene.camera.adjustOrientation(this.orientation);
        this.sprite.setFrame(`door_${Door.FRAME_OFFSET[orientationIndex][7]}`);
    }

    updateSpritePosition() {
        
        this.sprite.x = 8;
        this.sprite.y = 34;

        const adjustedOrientation = this.scene.camera.adjustOrientation(this.orientation);
        const orientationIndex = this.scene.camera.adjustOrientation(ORIENTATION.SOUTH_WEST);

        this.sprite.x += (Door.FRAME_OFFSET[orientationIndex][0] +  Door.FRAME_OFFSET[adjustedOrientation][4]) * 4;
        this.sprite.y += Door.FRAME_OFFSET[orientationIndex][1] +  Door.FRAME_OFFSET[adjustedOrientation][5];

        this.sprite.setDepth(Door.FRAME_OFFSET[adjustedOrientation][6]);

        super.updateSpritePosition();
        
    }

    open() {
        this.changeDoorState(true);
    }

    close() {
        this.changeDoorState(false);
    }

    changeDoorState(open) {

        if (this.isOpen == open) return;

        if (this.sprite.visible) this.scene.sound.playAudioSprite('sound', open ? 'open' : 'close');

        const diffOrientation = open ? 1 : -1;
        const newOrientation = (this.inward) ? (this.orientation - diffOrientation) & 0x03 : (this.orientation + diffOrientation) & 0x03;

        const vector = {
            x: 2 * Door.FRAME_OFFSET[newOrientation][10],
            y: 2 * Door.FRAME_OFFSET[newOrientation][11]
        }

        const height = this.getTerrainHeight(vector);

        if (height < 0x10) {
            this.isOpen = open;
            this.updateDoorHeight(this.height);
            this.orientation = newOrientation;
        }

    }

    reOrderTiles(position) {

        // FIXME: big door depth issues when closed
        const adjustedOrientation = this.scene.camera.adjustOrientation(this.orientation);
        const orientationIndex = this.scene.camera.adjustOrientation(ORIENTATION.SOUTH_WEST);
        position.x += Door.FRAME_OFFSET[orientationIndex][2] + Door.FRAME_OFFSET[adjustedOrientation][8];
        position.y += Door.FRAME_OFFSET[orientationIndex][3] + Door.FRAME_OFFSET[adjustedOrientation][9];
        
        this.scene.abadiaBuilder.reOrderTiles(this.sprite, position);
    }

    updateDoorHeight(value) {

        let posX = this.position.x;
        let posY = this.position.y;

        for (let i = 0; i < 2; i++) {
            
            posX += Door.FRAME_OFFSET[this.orientation][10];
            posY += Door.FRAME_OFFSET[this.orientation][11];
            this.scene.abadiaBuilder.setHeight(this.floor, this.room.x, this.room.y, posX, posY, value);
        }
        
    }

}

export default Door;