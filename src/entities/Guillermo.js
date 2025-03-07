import { FLOOR, TICK_TIME } from '../constants';
import Actor from './Actor';
import Item from './Item';

class Guillermo extends Actor {
    constructor(scene, config) {
        super(scene, config, 'guillermo');
        this.initControls();

        this.alive = true;
        this.tags['guillermoPoisoned'] = false;
    }

    initControls() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.space = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyN = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);

        this.keyQ = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyR = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }

    handleControls() {

        if (!this.alive) return;
        if (this.scene.camera.actor != this) return;
        
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.performAction(Actor.Action.TURN_LEFT);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.performAction(Actor.Action.TURN_RIGHT);
        }
    
        if (!this.inWaitingFrame()) return;

        if (Phaser.Input.Keyboard.JustDown(this.keyS)) this.scene.adso.guillermoAnswer(true);
        if (Phaser.Input.Keyboard.JustDown(this.keyN)) this.scene.adso.guillermoAnswer(false);

        if (Phaser.Input.Keyboard.JustDown(this.space)) this.leaveItem();
        
        if (this.cursors.up.isDown) {
            this.performAction(Actor.Action.WALK);
        } else {
            this.performAction(Actor.Action.STOP);
        }

        if (this.keyQ.isDown && this.keyR.isDown) this.tryToOpenMirror();
        
    }

    leaveItem() {
        if (this.inventory.length == 0) return;

        const itemId = Math.min(...this.inventory);

        super.leaveItem(itemId);
        
    }

    tryToOpenMirror() {

        if (!this.scene.logic.mirrorClosed) return;

        if (this.room.x != 2 || this.room.y != 6 || this.floor != FLOOR.LIBRARY) return;

        if (this.position.x != 2 || this.height != 4) return;

        const mirrorPositionMapping = {
            13: 0,
            9: 1,
            5: 2
        };
        
        const mirrorPosition = mirrorPositionMapping[this.position.y];

        if (this.scene.logic.romanNumber == mirrorPosition) {

            this.scene.abadiaBuilder.openMirror();

        } else {

            this.scene.abadiaBuilder.openTrap();
            this.scene.logic.gameOver = true;
            this.position.x--;
            this.draw();
            this.dieWithStyle(true);
            this.scene.adso.isActive = false;
            this.scene.board.showPhrase(0x22);

        }

        this.scene.sound.playAudioSprite('sound', 'mirror');
        this.scene.logic.mirrorClosed = false;
        this.scene.guillermoReflection.hide();
        this.scene.adsoReflection.hide();
        this.scene.abadiaBuilder.reBuildRoom();

    }
    
    dieWithStyle(fall = false) {

        this.alive = false;

        this.scene.tweens.add({
            targets: this.sprite, 
            y: (fall ? this.sprite.y + 35 : -35),
            duration: 3000,
            ease: 'Linear',
            onComplete: () => {
                this.inactive();
            }
        });
    }

    checkPoisoned() {

        if (!this.inventory.has(Item.BOOK)) return;

        if (this.inventory.has(Item.GLOVES)) return;

        this.addTagEvent('guillermoPoisoned', 0xFF * TICK_TIME);

        if (this.tags['guillermoPoisoned']) {

            this.poisoned();

        }

    }

    poisoned() {
        
        this.dieWithStyle();
        this.scene.logic.gameOver = true;
        this.scene.board.showPhrase(0x22);
        this.removeTagEvent('guillermoPoisoned');

    }
}

export default Guillermo;