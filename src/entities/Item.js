import Entity from "./Entity";

class Item extends Entity {

    static BOOK = 0;
    static GLOVES = 1;
    static GLASSES = 2;
    static SCROLL = 3;
    static KEY1 = 4;
    static KEY2 = 5;
    static KEY3 = 6;
    static LAMP = 7;

    static FRAME_NAME = [ 'book', 'gloves', 'glasses', 'scroll', 'key1', 'key2', 'key3', 'lamp' ];

    constructor(scene, config) {
        
        super(scene, config, 'objects');

        this.id = config.id;
        this.actor = scene.actors[config.actor] ?? null;
        this.hidden = config.hidden || false;
    
        this.resetTexture();
        this.updateSpritePosition();
    }

    update() {

    }

    updateVisibility() {

        if (this.hidden || (this.actor != null)) {
            this.sprite.setVisible(false)
        } else {
            this.sprite.setVisible(this.isVisibleInCurrentRoom());
        }
        
    }

    updateSpriteFrame() {
        this.sprite.setFrame(`${Item.FRAME_NAME[this.id]}`);
    }

    updateSpritePosition() {
        
        this.sprite.x = 0;
        this.sprite.y = 26;

        this.sprite.setDepth(0);

        super.updateSpritePosition();
        
    }

    setPosition(pos) {
        super.setPosition(pos);
        this.hidden = false;
        this.actor = null;
    }

}

export default Item;