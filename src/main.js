// main.js
import Phaser, {Game} from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import ScrollScene from './scenes/ScrollScene';
import EndScene from './scenes/EndScene';

const config = {
  type: Phaser.AUTO,
  pixelart: true,
  scale: {
    mode: Phaser.Scale.NONE,
    parent: 'gameContainer',
    width: 320,
    height: 200,
    zoom: 2
  },
  fps: {
    target: 60,
    forceSetTimeOut: true
  },
  scene: [
    BootScene,
    PreloadScene,
    ScrollScene,
    GameScene,
    EndScene
  ]
};

const game = new Game(config);