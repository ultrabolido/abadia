import { FLOOR } from "../constants";
import Actor from "./Actor";

class Reflection extends Actor {

    constructor(scene, actor) {
        
        const config = {
            room: { x: 2, y: 6},
            floor: FLOOR.LIBRARY
        }
        
        super(scene, config, actor.spriteName);

        this.actor = actor;
        this.resetTexture();
        this.updateSpritePosition();
    }

    update() {
        
        let posX = this.actor.room.x << 4 | this.actor.position.x;
        posX = 0x21 - ( posX - 0x21 );
        this.position.x = posX & 0x0F;
        this.room.x = (posX & 0xF0) >> 4;
        
        this.position.x -= this.actor.onStairs ? 1 : 0;
        
        this.position.y = this.actor.position.y;
        this.height = this.actor.height;

        this.orientation = ((this.actor.orientation & 0x01) == 0) ? this.actor.orientation ^ 2 : this.actor.orientation;
        this.currentFrame = this.actor.currentFrame ^ 2;

        this.onStairs = this.actor.onStairs;
        this.goingDown = this.actor.goingDown;
        this.turnedOnStairs = this.actor.turnedOnStairs;

        this.draw();
        
    }

}

export default Reflection;