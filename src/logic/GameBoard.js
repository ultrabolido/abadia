import { SCREEN_OFFSET_X, TEXT_COLOR_DAY, TEXT_COLOR_NIGHT } from '../constants';

class GameBoard {

    static ROMAN_NUMBER = [ 'IXX', 'XIX', 'XXI' ];
    static ROMAN_DAY = [ '-I-', '-II', 'III', '-IV', '-V-', '-VI', 'VII' ];
    static TIME_OF_DAY = [ ' NOCHE ', ' PRIMA ', 'TERCIA ', ' SEXTA ', ' NONA  ', 'VsPERAS', 'COMpets' ];
    static OBJECTS = [ 'book', 'gloves', 'glasses', 'scroll', 'key1', 'key2' ];

    constructor(scene) {
        this.scene = scene;

        this.daySprite = [];
        this.phrases = scene.cache.json.get('phrases');
        this.container = scene.add.container(SCREEN_OFFSET_X, 160).setDepth(1000);

        this.board = scene.add.image(0,0).setOrigin(0,0);
        this.container.add(this.board);
        
        this.createTimeOfDayUI();
        this.createDayUI();
        this.createObjectsUI();
        this.createPhraseUI();
        this.createObsequiumUI();
        this.createYesNoUI();

        this.resetBoard();

        this.scene.events.on('updateday', this.updateDay, this);
        this.scene.events.on('updatetimeofday', this.updateTimeOfDay, this);
        this.scene.events.on('updateobsequium', this.updateObsequium, this);
        this.scene.events.on('updateobjects', this.updateObjects, this );

        this.updateObjects();
        this.updateObsequium();

    }

    createYesNoUI() {
        this.yesNoUI = this.scene.add.bitmapText(320 / 2, 160 + 4,'font','S:N').setOrigin(0.5,0.5).setTint(TEXT_COLOR_NIGHT).setDepth(1001);
        this.yesNoUI.setVisible(false);
    }

    createObsequiumUI() {

        this.obsequiumUI = this.scene.add.rectangle(208, 17, 1, 6, 0x000000).setOrigin(0,0);
        this.container.add(this.obsequiumUI);

    }

    createPhraseUI() {

        const maskBackground = this.scene.add.rectangle(SCREEN_OFFSET_X + 64, 160 + 4, 128, 8, 0x000000).setOrigin(0,0).setDepth(1000);
        this.phraseText = this.scene.add.bitmapText(SCREEN_OFFSET_X + 64 + 128, 160 + 4,'font','',8).setOrigin(0,0).setDepth(1001);
        
        const geometryMask = maskBackground.createGeometryMask();
        this.phraseText.setMask(geometryMask);

    }

    createTimeOfDayUI() {

        this.textBackground = this.scene.add.rectangle(SCREEN_OFFSET_X + 4, 160 + 20, 56, 8).setOrigin(0,0).setDepth(1000);
        this.timeOfDayText = this.scene.add.bitmapText(SCREEN_OFFSET_X + 4, 160 + 20,'font','       ',8).setOrigin(0,0).setTint(0x000000).setDepth(1001);
        
        const geometryMask = this.textBackground.createGeometryMask();
        this.timeOfDayText.setMask(geometryMask);

    }

    createDayUI() {

        const blackLine = this.scene.add.rectangle(36, 5, 24, 1, 0x000000).setOrigin(0,0);
        this.container.add(blackLine);

        for (let i=0; i < 3; i++) {
            this.daySprite[i] = this.scene.add.sprite(36 + i * 8, 5).setOrigin(0,0);
            this.container.add(this.daySprite[i]);
        }

    }

    createObjectsUI() {
        this.objects = [];
        for (let i=0; i < 6; i++ ) {
            this.objects[i] = this.scene.add.sprite(68 + 20 * i + ((i > 2) ? 4 : 0), 16).setOrigin(0,0);
            this.container.add(this.objects[i]);
        }
    }

    resetBoard() {

        const time = this.scene.logic.isNight() ? "night" : "day";
        this.board.setTexture(`hud_${time}`);
        for(let i=0; i < 3; i++) {
            this.daySprite[i].setTexture(`days_${time}`);
        }
        for(let i=0; i < 6; i++) {
            this.objects[i].setTexture(`objects_${time}`);
            this.objects[i].setFrame(GameBoard.OBJECTS[i]);
        }
        this.textBackground.setFillStyle(this.scene.logic.isNight() ? TEXT_COLOR_NIGHT : TEXT_COLOR_DAY);
        this.phraseText.setTint(this.scene.logic.isNight() ? TEXT_COLOR_NIGHT : TEXT_COLOR_DAY);
        
        this.updateDay();

    }

    updateDay() {

        const romanDay = GameBoard.ROMAN_DAY[this.scene.logic.day - 1];

        for(let i=0; i < 3; i++) {
            const char = romanDay.charAt(i);

            if (char === '-') {
                this.daySprite[i].setVisible(false);
            } else {
                this.daySprite[i].setVisible(true);
                this.daySprite[i].setFrame(char);
            }
        }

    }

    updateTimeOfDay() {
       
        this.timeOfDayText.setText(this.timeOfDayText.text + GameBoard.TIME_OF_DAY[this.scene.logic.timeOfDay]);

        this.timeOfDayTween = this.scene.tweens.add({
            targets: this.timeOfDayText,
            x: SCREEN_OFFSET_X - 52,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                this.timeOfDayText.setText(GameBoard.TIME_OF_DAY[this.scene.logic.timeOfDay]);
                this.timeOfDayText.x = SCREEN_OFFSET_X + 4;
            }
        });
       
    }

    showPhrase(id, now = false) {
        
        if (this.displayingPhrase() && !now) return;

        if (this.displayingPhrase()) {
            this.phraseTween.stop();
            this.scene.sound.stopAll();
            this.phraseText.x = SCREEN_OFFSET_X + 64 + 128;
        }
        
        this.phraseText.setText(this.phrases[id]);

        if (id == 0) this.phraseText.text = this.phraseText.text.replace('AAA', GameBoard.ROMAN_NUMBER[this.scene.logic.romanNumber]);
        
        this.phraseTween = this.scene.tweens.add({
            targets: this.phraseText,
            x: SCREEN_OFFSET_X + 64 - this.phraseText.text.length * 8,
            duration: 200 * Math.max(16, this.phraseText.text.length),
            ease: 'Linear',
            onComplete: () => {
                this.phraseText.x = SCREEN_OFFSET_X + 64 + 128;
                if (id == 0x12) this.showYesNo();
            },
            onUpdate: () => {
                if (this.phraseText.x < SCREEN_OFFSET_X + 64 + 128 - this.phraseText.text.length * 8) {
                    this.scene.sound.stopAll();
                }
            }
        });

        this.scene.sound.playAudioSprite('sound', 'letters', { loop: true });
        
    }
    
    displayingPhrase() {
        return this.phraseTween && this.phraseTween.isPlaying();
    }

    updateObjects() {
        
        const inventory = this.scene.guillermo.inventory;
        for (let i=0; i < 6; i++) {
            this.objects[i].setVisible(inventory.has(i));
        }
        
    }

    updateObsequium() {

        this.obsequiumUI.x = 208 + this.scene.logic.obsequium;
        this.obsequiumUI.width = 31 - this.scene.logic.obsequium + 1;

    }

    showYesNo() {
        this.yesNoEvent = this.scene.time.addEvent({
            delay: 200,
            callback: () => {
                this.yesNoUI.setVisible(!this.yesNoUI.visible);
            },
            loop: true
        });     
    }

    removeYesNo() {

        if (!this.yesNoEvent) return;

        this.yesNoEvent.destroy();
        this.yesNoUI.setVisible(false);
    }
    
    removeAllEvents() {
        this.scene.events.off('updateday');
        this.scene.events.off('updatetimeofday');
        this.scene.events.off('updateobsequium');
        this.scene.events.off('updateobjects');
    }

}

export default GameBoard;