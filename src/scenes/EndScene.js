import { Scene } from 'phaser';
import { SCREEN_OFFSET_X, TEXT_COLOR_DAY, TEXT_COLOR_NIGHT } from '../constants';

class EndScene extends Scene {

    constructor() {
        super("EndScene");
    }

    init(data) {
        this.percentage = (data.percentage.length == 1) ? '0' + data.percentage : data.percentage;
        this.color = data.isNight ? TEXT_COLOR_NIGHT : TEXT_COLOR_DAY;
    }

    create() {
        
        this.add.rectangle(SCREEN_OFFSET_X, 0, 256, 160, 0x000000).setOrigin(0,0);
        this.add.bitmapText(160, 32,'font','HAS RESUELTO EL').setOrigin(0.5,0).setTint(this.color);
        this.add.bitmapText(160, 48,'font', this.percentage + ' POR CIENTO').setOrigin(0.5,0).setTint(this.color);
        this.add.bitmapText(160, 64,'font','DE LA INVESTIGACION').setOrigin(0.5,0).setTint(this.color);
        this.add.bitmapText(160, 128,'font','PULSA ESPACIO PARA EMPEZAR').setOrigin(0.5,0).setTint(this.color);

        this.input.keyboard.on('keydown', this.nextScene, this);

    }

    nextScene() {
      
        this.scene.start('GameScene');
    
    }

}

export default EndScene;

