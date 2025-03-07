import { Scene } from 'phaser';

class ScrollScene extends Scene {
  constructor() {
    super("ScrollScene");
  }

  init(scrollType) {
    this.scrollType = scrollType;
  }

  preload() {
    
    this.add.image(0, 0, 'scroll').setOrigin(0,0);
    
    this.load.json('scrollChars', 'assets/txt/scrollChars.json');
    this.load.json('scrollText', 'assets/txt/scrollText.json');
  
  }

  create() {

    this.graphics = this.add.graphics();
    this.charMap = new Map(this.cache.json.get('scrollChars'));
    const { beginScroll, endScroll } = this.cache.json.get('scrollText');
    this.posX = 76;
    this.posY = 16;

    this.scroll = (this.scrollType == 'B') ? beginScroll : endScroll;
    this.page = 0;
    this.line = 0;
    this.char = 0;
    this.pixel = 0;

    this.input.keyboard.on('keydown', this.nextScene, this);

    this.music = this.sound.addAudioSprite('music');
    this.music.play(this.scrollType == 'B' ? 'begin' : 'end');
    this.music.on('complete', () => {
      
      const seek = this.scrollType == 'B' ? 837 / 1000 : 0;
      this.music.play(this.scrollType == 'B' ? 'begin' : 'end', { seek });

    });

    this.drawScroll();
  
  }

  drawScroll() {

    const c = this.getChar();
    
    switch (c) {
      
      case ' ': // Space character
        this.posX += 10;
        this.char++;
        this.time.delayedCall(50, this.drawScroll, [], this );
        break;
      
      case '/': // Line break
        this.posX = 76;
        this.posY += 16;
        this.line++;
        this.char = 0;
        this.pixel = 0;
        this.time.delayedCall(500, this.drawScroll, [], this );
        break;

      case '$': // Page break
        this.posX = 76;
        this.posY = 16;
        this.line = 0;
        this.page++;
        this.char = 0;
        this.line = 0;
        if ( this.getChar() != "#" ) {
          this.time.delayedCall(2000, this.changePage, [], this );
        } else {
          this.time.delayedCall(5000, this.nextScene, [], this);
        }
        break;

      default:
        const charData = this.charMap.get(c);
        this.drawPixel(charData, (c.charCodeAt(0) & 0x60) == 0x40 ? 0xFF0000 : 0x000000);
        this.pixel++;
        if ( charData.pixels.length <= this.pixel ) {
          this.posX += charData.width;
          this.char++;
          this.pixel = 0;
        }
        if (this.pixel % 4 == 0) {
           this.time.delayedCall(10, this.drawScroll, [], this );
        } else {
          this.drawScroll();
        }
    }
  }

  changePage() {
    this.graphics.destroy();
    this.graphics = this.add.graphics();
    this.drawScroll();
  }

  drawPixel(charData, color) {

    const x = this.posX + charData.pixels[this.pixel].x;
    const y = this.posY + charData.pixels[this.pixel].y;
    
    this.graphics.fillStyle(color);
    this.graphics.fillRect(x, y, 1, 1);

  }

  nextScene() {
      
    this.music.stop();
    this.scene.start('GameScene');

  }

  getChar() {
    if ( this.scroll.length <= this.page ) return '#'; // End of scroll
    if ( this.scroll[this.page].length <= this.line ) return '$'; // End of page
    if ( this.scroll[this.page][this.line].length <= this.char ) return '/'; // End of line
    
    return this.scroll[this.page][this.line][this.char];
  }

}

export default ScrollScene;