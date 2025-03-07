import { Scene } from 'phaser';

class PreloadScene extends Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
   
    this.load.bitmapFont('font', 'assets/gfx/ui/charset.png', 'assets/gfx/ui/charset.xml');

    this.load.atlas('tiles_day', 'assets/gfx/tiles/tiles_day.png', 'assets/gfx/tiles/tiles.json');
    this.load.atlas('tiles_night', 'assets/gfx/tiles/tiles_night.png', 'assets/gfx/tiles/tiles.json');
    this.load.atlas('days_day', 'assets/gfx/ui/days_day.png', 'assets/gfx/ui/days.json');
    this.load.atlas('days_night', 'assets/gfx/ui/days_night.png', 'assets/gfx/ui/days.json');

    this.load.audioSprite('music', ' assets/audio/music.json', 'assets/audio/music.ogg');
    this.load.audioSprite('sound', ' assets/audio/sound.json', 'assets/audio/sound.ogg');
    
    this.load.text('scripts', 'assets/abadia/scripts.abs');
    
    this.load.image('hud_day', 'assets/gfx/ui/hud_day.png');
    this.load.image('hud_night', 'assets/gfx/ui/hud_night.png');
    this.load.image('scroll', 'assets/gfx/ui/scroll.png');

    this.load.image('light', 'assets/gfx/sprites/light.png');

    ['guillermo', 'adso', 'abad', 'severino', 'berengario', 'malaquias', 'bernardo', 'hooded', 'jorge', 'objects', 'doors'].forEach ( sprite => {
      const json = (sprite == 'adso' || sprite == 'objects' || sprite == 'doors') ? sprite : 'monk';
      this.load.atlas(`${sprite}_day`,`assets/gfx/sprites/${sprite}_day.png`,`assets/gfx/sprites/${json}.json`);
      this.load.atlas(`${sprite}_night`,`assets/gfx/sprites/${sprite}_night.png`,`assets/gfx/sprites/${json}.json`);
    });
    
  }

  create() {

    this.add.image(0, 0, 'title').setOrigin(0,0);

    // Parsear scripts
    const scriptFile = this.cache.text.get('scripts');
    const parsedScripts = this.parseScripts(scriptFile);
  
    // Guardar los scripts parseados en el registry
    this.registry.set('parsedScripts', parsedScripts);

    this.input.keyboard.on('keydown', this.nextScene, this);

  }

  nextScene() {
    this.scene.start('ScrollScene', 'B');
  }

  parseScripts(scriptFile) {

    const scripts = [];
    const scriptText = scriptFile.split(/\n\s*\n/);

    for (let i = 0; i < scriptText.length; i++) {
      const scriptLines = scriptText[i].split('\n');
      
      const script = {
        id: scriptLines[0].slice(1, -1),
        tiles: [],
        lines: []
      }

      for (let j = 1; j < scriptLines.length; j++) {
        const line = scriptLines[j].split(/ (.*)/s);

        if (line[0] == 'TILES') {
          script.tiles = line[1].split(',');
        } else {
          script.lines.push({
            opcode: line[0],
            params: line[1] ? line[1].replaceAll(' ', '').split(',') : []
          })
        }
      }

      scripts[script.id] = script;
    }

    return scripts;
  }

}

export default PreloadScene;