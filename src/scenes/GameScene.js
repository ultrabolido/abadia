import { Scene } from 'phaser';
import { ACTOR, DOOR, ITEM } from '../config/entities';
import AbadiaBuilder from '../levels/AbadiaBuilder';
import AbadiaCamera from '../levels/AbadiaCamera';
import Guillermo from '../entities/Guillermo';
import Adso from '../entities/Adso';
import Abad from '../entities/Abad';
import Severino from '../entities/Severino';
import Berengario from '../entities/Berengario';
import Malaquias from '../entities/Malaquias';
import Bernardo from '../entities/Bernardo';
import Jorge from '../entities/Jorge';
import Door from '../entities/Door';
import Item from '../entities/Item';
import Lamp from '../entities/Lamp';
import Reflection from '../entities/Reflection';
import { FLOOR, ORIENTATION, SCREEN_OFFSET_X, TICK_TIME } from '../constants';
import GameLogic from '../logic/GameLogic';
import GameBoard from '../logic/GameBoard';

class GameScene extends Scene {

  constructor() {
      super("GameScene");
  }

  preload() {

    this.load.json('floors', 'assets/abadia/floors.json');
    this.load.json('rooms', 'assets/abadia/rooms.json');
    this.load.json('phrases', 'assets/txt/phrases.json');
    
  }

	create() {

    this.actors = [];
    this.doors = [];
    this.items = [];

    this.logic = new GameLogic(this);

    this.abadiaBuilder = new AbadiaBuilder(this);
    
    this.camera = new AbadiaCamera(this);

    this.createLight();
    this.createOverlay();

    this.initControls();

    this.createEntites();

    this.music = this.sound.addAudioSprite('music');

    this.board = new GameBoard(this);

    this.camera.follow(this.guillermo);
    this.logic.defaultCameraActor = this.guillermo;

    this.time.addEvent({delay: 100, loop: true, callback: this.updateGame, callbackScope: this});
    this.idleTimeActive = false;
    this.idleTimerConfig = {delay: 0x1E * TICK_TIME, callback: () => this.idleTimeActive = true, callbackScope: this, loop: true }
    this.idleTimer = this.time.addEvent(this.idleTimerConfig);
    
    this.events.on('changedaynight', this.changeDayNight, this);
    this.events.on('shutdown', this.shutdown, this);

    //this.setDay(5, GameLogic.TIME_OF_DAY.SEXTA);
    this.logic.advanceTime();
    
	}

  setDay(day, timeOfDay) {

    if (timeOfDay == GameLogic.TIME_OF_DAY.NOCHE) {
      timeOfDay = GameLogic.TIME_OF_DAY.COMPLETAS;
      day -= 1;
    } else {
      timeOfDay -= 1;
    }

    let exit = false;
    
    while (!exit) {

      this.logic.advanceTime();
      this.logic.executeTimeOfDayActions();

      exit = (this.logic.day == day) && (this.logic.timeOfDay == timeOfDay);

    }

    this.logic.advanceTimeOfDay = true;

    switch (timeOfDay) {

      case GameLogic.TIME_OF_DAY.SEXTA:
      case GameLogic.TIME_OF_DAY.NONA:
      case GameLogic.TIME_OF_DAY.COMPLETAS:
      case GameLogic.TIME_OF_DAY.NOCHE:
        this.abad.setPosition(0);
        this.adso.setPosition(2);
        this.berengario.setPosition(3);
        this.severino.setPosition(2);
        this.malaquias.setPosition(7);
        this.bernardo.setPosition(3);
        //this.jorge.setPosition(0);
        this.guillermo.setPosition({ floor: FLOOR.MAIN, room: { x: 10, y: 1 }, position: { x: 8, y: 10}, orientation: ORIENTATION.NORTH_EAST, height: 2 });
        //this.guillermo.setPosition({ floor: FLOOR.LIBRARY, room: { x: 2, y: 6 }, position: { x: 8, y: 8}, orientation: ORIENTATION.NORTH_EAST, height: 2 });
        //this.adso.setPosition({ floor: FLOOR.LIBRARY, room: { x: 2, y: 6 }, position: { x: 8, y: 6}, orientation: ORIENTATION.NORTH_EAST, height: 2 });
        break;

      case GameLogic.TIME_OF_DAY.TERCIA:
        this.abad.reached = 3;
        this.abad.setPosition(3);
        this.berengario.setPosition(2);
        this.severino.setPosition(2);
        this.malaquias.setPosition(2);
        this.guillermo.setPosition({ floor: FLOOR.MAIN, room: { x: 2, y: 6 }, position: { x: 8, y: 8}, orientation: ORIENTATION.NORTH_EAST, height: 0 });
        this.adso.setPosition({ floor: FLOOR.MAIN, room: { x: 2, y: 6 }, position: { x: 8, y: 10}, orientation: ORIENTATION.NORTH_EAST, height: 0 });
        break;


    }

    if (timeOfDay == GameLogic.TIME_OF_DAY.NOCHE) {
      this.logic.openAllDoors();    
      this.doors[Door.BIG].locked = true;
      this.doors[Door.BIG + 1].locked = true;
      this.doors[Door.CHURCH_CELLS].locked = true;
    }

    if (day > 2) {
      this.adso.inventory.add(Item.KEY3);
      this.items[Item.KEY3].actor = this.adso;
      this.adso.updateAuthDoors();
      this.berengario.inactive();
    }

    if (day > 2) {
      this.severino.hasPresentedGuillermo = true;
    }

    if (day > 4) {
      this.severino.inactive();
      this.guillermo.inventory.add(Item.KEY1);
      this.items[Item.KEY1].actor = this.guillermo;
      this.guillermo.updateAuthDoors();
      this.board.updateObjects();
      this.malaquias.state = 6;
      this.bernardo.inactive();
    }

    if (day > 5) {
      this.guillermo.inventory.add(Item.GLASSES);
      this.items[Item.GLASSES].actor = this.guillermo;
      this.board.updateObjects();
      this.items[Item.SCROLL].setPosition(this.abad.defaultPositions[2]);
    }

    if (day >= 6) {
      this.malaquias.inactive();
      this.guillermo.inventory.add(Item.KEY2);
      this.items[Item.KEY2].actor = this.guillermo;
      this.guillermo.inventory.add(Item.SCROLL);
      this.items[Item.SCROLL].actor = this.guillermo;
      this.guillermo.inventory.add(Item.GLOVES);
      this.items[Item.GLOVES].actor = this.guillermo;
      this.board.updateObjects();

      this.adso.inventory.add(Item.LAMP);
      this.items[Item.LAMP].actor = this.adso;
    }

    this.events.emit('updateday');
    this.camera.reset();
    this.changeDayNight();
  }

  initControls() {

    this.keyPLUS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD);
    this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on('keydown', (event) => {

      if (event.keyCode >= 49 && event.keyCode <= 57) {
          const actor = this.actors[event.keyCode - 49];
          if (!actor || !actor.isActive) return;
          this.camera.follow(actor);
          this.logic.defaultCameraActor = actor;
      }});

  }

  createEntites() {

    // Actors
    this.guillermo = new Guillermo(this, ACTOR.guillermo);
    this.adso = new Adso(this, ACTOR.adso);
    this.malaquias = new Malaquias(this, ACTOR.malaquias);
    this.abad = new Abad(this, ACTOR.abad);
    this.berengario = new Berengario(this, ACTOR.berengario);
    this.severino = new Severino(this, ACTOR.severino);
    this.jorge = new Jorge(this, ACTOR.jorge);
    this.bernardo = new Bernardo(this, ACTOR.bernardo);
    this.actors.push(this.guillermo);
    this.actors.push(this.adso);
    this.actors.push(this.malaquias);
    this.actors.push(this.abad);
    this.actors.push(this.berengario);
    this.actors.push(this.severino);
    this.actors.push(this.jorge);
    this.actors.push(this.bernardo);

    this.guillermoReflection = new Reflection(this, this.guillermo);
    this.adsoReflection = new Reflection(this, this.adso);

    // Doors
    for (let i=0; i < DOOR.length; i++) {
      this.doors.push(new Door(this, DOOR[i]));
    }

    // Objects
    for (let i=0; i < ITEM.length; i++) {
      this.items.push(new Item(this, ITEM[i]));
    }

  }

  update() {
    this.debugControls();
    this.guillermo.handleControls();
  }

  updateGame() {
 
    this.logic.updateTimeOfDay();

    this.checkGameOver();

    this.guillermo.checkPoisoned();

    this.logic.updateBonus();

    this.checkCameraChange();

    // pickup items
    this.actors.forEach( actor => actor.tryToPickupItem());

    // update behaviour and paths
    this.items.forEach( item => item.update());
    this.doors.forEach( door => door.update());
    this.actors.forEach( actor => actor.update());

    // draw
    this.actors.forEach( actor => actor.draw());
    this.doors.forEach( door => door.draw());
    this.items.forEach( item => item.draw());

    // draw reflections
    if (this.logic.mirrorClosed) {
      this.adsoReflection.update();
      this.guillermoReflection.update();
    }

    this.updateLight();
    
  }

  checkCameraChange() {

    if (this.guillermo.inventory.has(Item.GLOVES) && (this.jorge.state == 0x0D || this.jorge.state == 0x0E || this.jorge.state == 0x0F)) {

      this.idleTimeActive = true;
      this.camera.follow(this.jorge);
      return;

    }
    
    if (this.cursors.up.isDown || this.cursors.left.isDown || this.cursors.right.isDown || this.board.displayingPhrase() || this.logic.gameOver) {
      
      this.idleTimer.reset(this.idleTimerConfig);
      this.idleTimeActive = false;
      this.camera.follow(this.guillermo);

      if (this.cursors.up.isDown || this.board.displayingPhrase() || this.logic.gameOver) {
        this.music.stop();
      }

    } else {

      if (this.idleTimeActive) {
        if (!this.music.isPlaying) this.music.play('ambient', { loop: true });
        const actor = this.logic.getCameraActor();
        this.camera.follow(actor);
      }
    }

  }

  updateLight() {

    if (this.camera.illuminatedRoom) {

      this.darkBackground.setVisible(false);
      this.lamp.off();

    } else {

      this.darkBackground.setVisible(true);
      if (this.adso.sprite.visible && this.adso.inventory.has(Item.LAMP)) {

        this.lamp.on();
        this.lamp.update();

      } 

    }

  }

  checkGameOver() {

    if (!this.logic.gameOver) return;

    this.camera.follow(this.guillermo);

    if (this.board.displayingPhrase()) return;

    this.sound.stopAll();

    if (this.logic.success) {
      
      this.scene.start('ScrollScene', 'E');

    } else {

      const percentage = this.logic.calculatePercentage();
      const isNight = this.logic.isNight();
      this.scene.launch('EndScene', { percentage, isNight });
      this.scene.pause();
    
    }

  }

  updateEntitiesVisibility() {

    this.actors.forEach ( actor => actor.hide());
    this.doors.forEach ( door => door.hide());
    this.items.forEach ( item => item.hide());
  }

  debugControls() {

    if (this.keyESC.isDown) {

      this.logic.gameOver = true;
      this.logic.success = false;

    }

    if (this.keyL.isDown) {
      this.adso.inventory.add(Item.LAMP);
      this.items[Item.LAMP].actor = this.adso;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyPLUS)) {
      this.logic.advanceTimeOfDay = true;
    }
  }

  changeDayNight() {

    this.abadiaBuilder.reBuildRoom();
    this.actors.forEach ( actor => actor.resetTexture());
    this.doors.forEach ( door => door.resetTexture());
    this.items.forEach ( item => item.resetTexture());
    this.board.resetBoard();
    this.guillermoReflection.resetTexture();
    this.adsoReflection.resetTexture();

  }

  createOverlay() {

    const mask = this.add.rectangle(SCREEN_OFFSET_X, 0, 256, 192, 0xffffff).setOrigin(0,0);
    mask.setVisible(false);
    const geometryMask = new Phaser.Display.Masks.GeometryMask(this, mask);
    this.cameras.main.setMask(geometryMask);

  }

  createLight() {

    this.darkBackground = this.add.rectangle(SCREEN_OFFSET_X, 0, 256, 160, 0x000000).setOrigin(0,0).setDepth(500);
    this.darkBackground.setVisible(false);

    this.lamp = new Lamp(this);

  }

  shutdown() {
    this.cache.json.remove('floors');
    this.cache.json.remove('rooms');
    this.cache.json.remove('phrases');
    this.time.removeAllEvents();
    this.board.removeAllEvents();
  }

}

export default GameScene;
