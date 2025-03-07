import { TICK_TIME } from '../constants';

class Lamp {

    constructor(scene) {
        this.scene = scene;
      
        this.sprite = scene.make.sprite({ x: 100, y: 100, key: 'light', add: false });
    
        const lightMask = new Phaser.Display.Masks.BitmapMask(scene, this.sprite);
        lightMask.invertAlpha = true;
        
        scene.darkBackground.mask = lightMask;

        this.reset();
    
    }

    on() {

        this.sprite.alpha = 1;
        this.lampUseEvent.paused = false;

    }

    off() {

        this.sprite.alpha = 0;
        this.lampUseEvent.paused = true;

    }

    reset() {
            
        if (this.lampUseEvent) this.lampUseEvent.destroy();
        this.lampUseEvent = this.scene.time.addEvent({ delay: 1 * TICK_TIME * 256, callback: this.exhausted, callbackScope: this, paused: true });;
        
    }

    exhausted() {

        this.off();
        this.scene.logic.resetLamp();
        this.scene.adso.lampExhausted = true;

    }

    timeUsed() {

        return this.lampUseEvent.getProgress();

    }

    update() {

        this.sprite.x = this.scene.adso.sprite.x + 6;
        this.sprite.y = this.scene.adso.sprite.y + 14;

        if (this.scene.adso.flipped()) {
            this.sprite.x -= 4;
        }
    
    }
    
   
}

export default Lamp;