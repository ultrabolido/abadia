import { Scene } from 'phaser';

class BootScene extends Scene {

    constructor() {
        super("BootScene");
    }

    preload() {

        this.load.image('title', 'assets/gfx/ui/title.png');

    }

    create() {
        
        this.scene.start('PreloadScene');
        
    }

}

export default BootScene;

