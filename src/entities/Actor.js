import { ORIENTATION, FLOOR_HEIGHT, SCREEN_OFFSET_X } from '../constants';
import { CONFIG } from '../config';
import Entity from './Entity';
import Door from './Door';
import Item from './Item';

class Actor extends Entity {

    static GUILLERMO = 0;
    static ADSO = 1;
    static MALAQUIAS = 2;
    static ABAD = 3;
    static BERENGARIO = 4;
    static SEVERINO = 5;
    static JORGE = 6;
    static BERNARDO = 7;
    
    static DISTANCE_OFFSETS = [
        [  6, 24,  6, 12 ],
        [  6, 12, 12, 24 ],
        [ 12, 24,  6, 12 ],
        [  6, 12,  6, 24 ]
    ];

    static MOVEMENT_VECTORS = [
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 1 }
    ];

    static COLLISION_CHECK_VECTORS = [
        //    (0,1)              (0,2)              (1,1)            (1,2)
        [{ x:  1, y: -1 }, { x:  1, y:  0 }, { x:  0, y: -1 }, { x:  0, y:  0 }],
        [{ x: -1, y: -2 }, { x:  0, y: -2 }, { x: -1, y: -1 }, { x:  0, y: -1 }],
        [{ x: -2, y:  0 }, { x: -2, y: -1 }, { x: -1, y:  0 }, { x: -1, y: -1 }],
        [{ x:  0, y:  1 }, { x: -1, y:  1 }, { x:  0, y:  0 }, { x: -1, y:  0 }]
    ];

    static COLLISION_CHECK_VECTORS_ON_STAIRS = [
        //    (0,1)              (0,2)              (1,1)            (1,2)
        [{ x:  2, y:  0 }, { x:  2, y:  1 }, { x:  1, y:  0 }, { x:  1, y:  1 }],
        [{ x:  0, y: -2 }, { x:  1, y: -2 }, { x:  0, y: -1 }, { x:  1, y: -1 }],
        [{ x: -2, y:  0 }, { x: -2, y: -1 }, { x: -1, y:  0 }, { x: -1, y: -1 }],
        [{ x:  0, y:  2 }, { x: -1, y:  2 }, { x:  0, y:  1 }, { x: -1, y:  1 }]
    ];

    static FRAME_OFFSET = [
        // [        - WALKING -            ],[       - TURNED_ON_STAIRS -      ],[          - GOING UP -           ],[          - GOING DOWN -       ]
        [
          [[{ x: 0, y: 0 },{ x: -1, y: -2 }],[{ x: -1, y:  2 },{ x: -2, y:  0 }],[{ x:  1, y:  2 },{ x:  0, y:  0 }],[{ x:  1, y:  2 },{ x:  0, y: -2 }]],
          [[{ x: 0, y: 0 },{ x: -1, y:  2 }],[{ x:  1, y:  2 },{ x:  0, y:  4 }],[{ x: -1, y:  2 },{ x: -2, y:  6 }],[{ x: -1, y:  2 },{ x: -2, y:  0 }]],
          [[{ x: 0, y: 0 },{ x:  1, y:  2 }],[{ x: -1, y:  2 },{ x:  0, y:  4 }],[{ x:  1, y:  2 },{ x:  2, y:  6 }],[{ x:  1, y:  2 },{ x:  2, y:  0 }]],
          [[{ x: 0, y: 0 },{ x:  1, y: -2 }],[{ x:  1, y:  2 },{ x:  2, y:  0 }],[{ x: -1, y:  2 },{ x:  0, y:  0 }],[{ x: -1, y:  2 },{ x:  0, y: -2 }]]
        ],
        [
          [[{ x: 0, y: 0 },{ x: -1, y: -2 }],[{ x: -1, y:  2 },{ x: -2, y:  0 }],[{ x: -1, y: -2 },{ x: -2, y: -4 }],[{ x: -1, y: -2 },{ x: -2, y: -6 }]],
          [[{ x: 0, y: 0 },{ x: -1, y:  2 }],[{ x: -1, y: -2 },{ x: -2, y:  0 }],[{ x: -1, y:  2 },{ x: -2, y:  6 }],[{ x: -1, y:  2 },{ x: -2, y:  0 }]],
          [[{ x: 0, y: 0 },{ x:  1, y:  2 }],[{ x: -1, y:  2 },{ x:  0, y:  4 }],[{ x: -1, y: -2 },{ x:  0, y:  2 }],[{ x: -1, y: -2 },{ x:  0, y: -4 }]],
          [[{ x: 0, y: 0 },{ x:  1, y: -2 }],[{ x: -1, y: -2 },{ x:  0, y: -4 }],[{ x: -1, y:  2 },{ x:  0, y:  0 }],[{ x: -1, y:  2 },{ x:  0, y: -2 }]]
        ],
        [
          [[{ x: 0, y: 0 },{ x: -1, y: -2 }],[{ x:  1, y: -2 },{ x:  0, y: -4 }],[{ x: -1, y: -2 },{ x: -2, y: -4 }],[{ x: -1, y: -2 },{ x: -2, y: -6 }]],
          [[{ x: 0, y: 0 },{ x: -1, y:  2 }],[{ x: -1, y: -2 },{ x: -2, y:  0 }],[{ x:  1, y: -2 },{ x:  0, y:  2 }],[{ x:  1, y: -2 },{ x:  0, y: -3 }]],
          [[{ x: 0, y: 0 },{ x:  1, y:  2 }],[{ x:  1, y: -2 },{ x:  2, y:  0 }],[{ x: -1, y: -2 },{ x:  0, y:  2 }],[{ x: -1, y: -2 },{ x:  0, y: -4 }]],
          [[{ x: 0, y: 0 },{ x:  1, y: -2 }],[{ x: -1, y: -2 },{ x:  0, y: -4 }],[{ x:  1, y: -2 },{ x:  2, y: -4 }],[{ x:  1, y: -2 },{ x:  2, y: -6 }]]
        ],
        [
          [[{ x: 0, y: 0 },{ x: -1, y: -2 }],[{ x:  1, y: -2 },{ x:  0, y: -4 }],[{ x:  1, y:  2 },{ x:  0, y:  0 }],[{ x:  1, y:  2 },{ x:  0, y: -2 }]],
          [[{ x: 0, y: 0 },{ x: -1, y:  2 }],[{ x:  1, y:  2 },{ x:  0, y:  4 }],[{ x:  1, y: -2 },{ x:  0, y:  2 }],[{ x:  1, y: -2 },{ x:  0, y: -4 }]],
          [[{ x: 0, y: 0 },{ x:  1, y:  2 }],[{ x:  1, y: -2 },{ x:  2, y:  0 }],[{ x:  1, y:  2 },{ x:  2, y:  6 }],[{ x:  1, y:  2 },{ x:  2, y:  0 }]],
          [[{ x: 0, y: 0 },{ x:  1, y: -2 }],[{ x:  1, y:  2 },{ x:  2, y:  0 }],[{ x:  1, y: -2 },{ x:  2, y: -4 }],[{ x:  1, y: -2 },{ x:  2, y: -6 }]]
        ]
    ];

    static State = {
        WAITING: 'WAITING',
        WALKING: 'WALKING'
    };

    static Action = {
        STOP: 'STOP',
        WALK: 'WALK',
        TURN_LEFT: 'TURN_LEFT',
        TURN_RIGHT: 'TURN_RIGHT'
    };

    static KEY_DOOR = [
        [ Item.KEY1, Door.ABAD_CELL],
        [ Item.KEY2, Door.SEVERINO_CELL],
        [ Item.KEY3, Door.PASSAGE]
    ]

    constructor(scene, config, spriteName) {
        
        super(scene, config, spriteName);

        this.inventory = new Set(config.inventory || []);
        this.authDoors = new Set(config.authDoors || []);
        this.pathDoors = new Set(config.pathDoors || []);
        this.authItems = new Set(config.authItems || []);
        this.pickpocket = config.pickpocket || false;
        this.isActive = config.isActive ?? true;

        this.pendingOrientation = null;
        this.currentState = Actor.State.WAITING;
        this.onStairs = false;
        this.firstStep = this.lastStep = false;
        this.goingDown = false;
        this.turnedOnStairs = false;
        this.doubleMotion = false;
        this.movementPossible = true;
        this.canPickupItems = true;
        this.pickupTimer = null;

        this.heightMarkValue = 0x10;
        this.state = 0;

        this.tagEvents = [];
        this.tags = [];

        this.events = new Phaser.Events.EventEmitter();
        
        this.currentFrame = 0;

        this.resetTexture();
        this.updateSpritePosition();
    }

    draw() {

        if (!this.isActive) return;
        super.draw();

    }

    updateAuthDoors() {

        if ((this != this.scene.guillermo) && (this != this.scene.adso)) return;

        for (let keyDoor of Actor.KEY_DOOR) {
            if (this.inventory.has(keyDoor[0])) {
                this.authDoors.add(keyDoor[1]);
            } else {
                this.authDoors.delete(keyDoor[1]);
            }
        }
    }

    update() {
    
        this.updateActorHeight(0);
        this.updateMotion();
        this.checkRoomTransition();
        this.updateActorHeight(this.heightMarkValue);

    }

    updateMotion() {

        this.movementPossible = true;

        if ((this.pendingOrientation !== null) && this.inWaitingFrame()) {

            this.currentFrame = 0;
            this.orientation = this.pendingOrientation;
            this.pendingOrientation = null;
            if (this.onStairs) this.turnedOnStairs = !this.turnedOnStairs;

        } else {

            if (this.currentState === Actor.State.WALKING) {
                
               if (this.inWaitingFrame()) {
                
                    if (this.canMove()) {
                        this.currentFrame = (this.currentFrame + 1) % 4;
                        this.moveForward();
                    } else {
                        this.movementPossible = false;
                    }

               } else {
                
                    this.currentFrame = (this.currentFrame + 1) % 4;

               }

               if ((this.currentFrame == 1 || this.currentFrame == 3) && this == this.scene.guillermo) {
                    this.scene.sound.playAudioSprite('sound', 'steps');
               }

               if (this.inWaitingFrame()) this.currentState = Actor.State.WAITING;
            }

        }

    }

    updateSpriteFrame() {
        const adjustedOrientation = this.scene.camera.adjustOrientation(this.orientation);
        this.sprite.setFrame(`walk_${adjustedOrientation}_${this.currentFrame}`);
    }

    updateSpritePosition() {
        
        const adjustedOrientation = this.scene.camera.adjustOrientation(this.orientation);

        let index = 0;

        if (this.onStairs) {
            index++;
            if (!this.turnedOnStairs) {
                index++;
                if (this.goingDown) index++;
            }
        }

        this.sprite.x = Actor.FRAME_OFFSET[this.scene.camera.orientation][adjustedOrientation][index][this.currentFrame & 0x01].x * 4;
        this.sprite.y = Actor.FRAME_OFFSET[this.scene.camera.orientation][adjustedOrientation][index][this.currentFrame & 0x01].y;

        this.sprite.setDepth(0);

        super.updateSpritePosition();
        
    }

    moveForward() {

        this.doubleMotion = false;
        
        this.advancePosition();

        if (!this.onStairs) {

            if (this.firstStep) {

                if (this.northOrientation()) {
                    this.advancePosition();
                    this.doubleMotion = true;
                }
                this.onStairs = true;
                this.firstStep = false;

            } 

        } else {

            if (!this.turnedOnStairs) {

                if (this.lastStep) {

                    if (!this.northOrientation()) {
                        this.advancePosition();
                        this.doubleMotion = true;
                    }
                    this.lastStep = this.onStairs = false;

                }

            } 

        }
    }

    advancePosition() {
        const movement = Actor.MOVEMENT_VECTORS[this.orientation];
        this.position.x += movement.x;
        this.position.y += movement.y;
    }

    canMove() {

        this.goingDown = false;

        if (!this.onStairs) {
            
            const collisionVectors = Actor.COLLISION_CHECK_VECTORS[this.orientation];

            const heightA = this.getTerrainHeight(collisionVectors[0]);
            const heightB = this.getTerrainHeight(collisionVectors[1]);

            if (heightA != heightB) return false;

            const diffHeight = heightA - this.height;

            if (Math.abs(diffHeight) > 1) return false;

            this.firstStep = (diffHeight != 0);
            this.goingDown = (diffHeight == -1);

            this.height = heightA;

        } else {

            const collisionVectors = Actor.COLLISION_CHECK_VECTORS_ON_STAIRS[this.orientation];

            const heightA = this.getTerrainHeight(collisionVectors[2]);
            const heightB = this.getTerrainHeight(collisionVectors[0]);

            // If there's an actor cannot move
            if (heightB > 0xF) return false;

            if (!this.turnedOnStairs) {

                const diffHeight = heightA - this.height;

                if (Math.abs(diffHeight) > 1) return false; 

                this.goingDown = (diffHeight == -1);
                this.height = heightA;

                this.lastStep = (heightA === heightB);

            } else {

                const heightN = this.northOrientation() ? heightB : heightA;

                if (heightN != this.height) return false;
            }

        }
        
        return true;
    }

    northOrientation() {
        return (this.orientation == ORIENTATION.NORTH_EAST) || (this.orientation == ORIENTATION.NORTH_WEST);
    }

    updateActorHeight(value) {

        this.scene.abadiaBuilder.updateHeight(this.floor, this.room.x, this.room.y, this.position.x, this.position.y, value);

        if (!this.onStairs) {
            this.scene.abadiaBuilder.updateHeight(this.floor, this.room.x, this.room.y, this.position.x - 1, this.position.y    , value);
            this.scene.abadiaBuilder.updateHeight(this.floor, this.room.x, this.room.y, this.position.x    , this.position.y - 1, value);
            this.scene.abadiaBuilder.updateHeight(this.floor, this.room.x, this.room.y, this.position.x - 1, this.position.y - 1, value);
        }
        
    }

    performAction(action) {
        
        switch (action) {
            case Actor.Action.STOP:
                break;
            case Actor.Action.WALK:
                this.currentState = Actor.State.WALKING;
                break;
            case Actor.Action.TURN_LEFT:
                this.pendingOrientation = (this.orientation + 1) % 4;
                break;
            case Actor.Action.TURN_RIGHT:
                this.pendingOrientation = (this.orientation + 3) % 4;
                break;
        }
    }

    checkRoomTransition() {
        let hasChangedRoom = false;

        if (this.height > FLOOR_HEIGHT) {
            
            this.floor++;
            this.height = 2;
            hasChangedRoom = true;

        } else {
            
            if ((this.height < 2) && (this.floor > 0)) {
                this.height = FLOOR_HEIGHT;
                this.floor--;
                hasChangedRoom = true;
            }

        }

        if (this.position.x < 0) {
            this.position.x &= 0xF;
            this.room.x--;
            hasChangedRoom = true;
        } else if (this.position.x > 15) {
            this.position.x &= 0xF;
            this.room.x++;
            hasChangedRoom = true;
        }

        if (this.position.y < 0) {
            this.position.y &= 0xF;
            this.room.y--;
            hasChangedRoom = true;
        } else if (this.position.y > 15) {
            this.position.y &= 0xF;
            this.room.y++;
            hasChangedRoom = true;
        }

        if (hasChangedRoom) {
            this.doubleMotion = false;
            this.events.emit('changeRoom', this.floor, this.room.x, this.room.y);
        }
    }

    inWaitingFrame() {
        return this.currentFrame % 2 === 0
    }

    canOpenDoor(doorId) {
        return this.authDoors.has(doorId);
    }

    leaveItem(itemId) {

        if (this.actions && this.actions.length != 0) return;

        if (!this.inventory.has(itemId)) return;

        const item = this.scene.items[itemId];
        
        if (CONFIG.actor_leaves_items_always_in_front || this.isVisibleInCurrentRoom()) {

            const vector = { x: 2 * Actor.MOVEMENT_VECTORS[this.orientation].x, y: 2 * Actor.MOVEMENT_VECTORS[this.orientation].y };
            const height = this.getTerrainHeight(vector);

            if (height >= 0xD) return;
            if ((height - this.height) >= 5) return;
            if (height != this.getTerrainHeight({x: vector.x, y: vector.y - 1})) return;
            if (height != this.getTerrainHeight({x: vector.x - 1, y: vector.y})) return;
            if (height != this.getTerrainHeight({x: vector.x - 1, y: vector.y - 1})) return;

            const posX = this.position.x + vector.x;
            const posY = this.position.y + vector.y;
            const coords = this.scene.abadiaBuilder.normalizeCoordinates(this.room.x, this.room.y, posX, posY);

            item.position.x = coords.x;
            item.position.y = coords.y;
            item.room.x = coords.rx;
            item.room.y = coords.ry;
            item.height = height;

        } else {

            item.position.x = this.position.x;
            item.position.y = this.position.y;
            item.room.x = this.room.x;
            item.room.y = this.room.y;
            item.height = this.height;
            
        }

        item.floor = this.floor;
        item.orientation = this.orientation ^ 0x02;
        item.actor = null;
        
        this.inventory.delete(itemId);

        if (this == this.scene.guillermo) {

            this.scene.sound.playAudioSprite('sound', 'leave');

        }
        
        this.finishLeaveOrPickupItems();

    }

    tryToPickupItem() {

        if (!this.isActive) return;

        if (!this.canPickupItems) return;

        for (let itemId of this.authItems) {

            if (this.inventory.has(itemId)) continue;

            const item = this.scene.items[itemId];
            if (item.hidden) continue;

            if ((item.actor != null) && !this.pickpocket) continue;

            let objPosition = (item.actor != null) ? item.actor : item;

            if (objPosition.floor != this.floor) continue;

            const diffHeight = objPosition.height - this.height;
            if ((diffHeight < 0) || (diffHeight >= 5)) continue;

            const posX = this.position.x + 2 * Actor.MOVEMENT_VECTORS[this.orientation].x;
            const posY = this.position.y + 2 * Actor.MOVEMENT_VECTORS[this.orientation].y;
            const coords = this.scene.abadiaBuilder.normalizeCoordinates(this.room.x, this.room.y, posX, posY);
            if (coords.x != objPosition.position.x) continue;
            if (coords.y != objPosition.position.y) continue;
            if (coords.rx != objPosition.room.x) continue;
            if (coords.ry != objPosition.room.y) continue;

            if (item.actor != null) {
                item.actor.inventory.delete(itemId);
            }

            this.inventory.add(itemId);
            item.actor = this;

            if (this == this.scene.guillermo) {

                if (itemId == Item.SCROLL) this.scene.logic.savedScroll = false;
                
                if (itemId == Item.SCROLL || itemId == Item.GLASSES) {
                    if (this.inventory.has(Item.SCROLL) && this.inventory.has(Item.GLASSES)) this.scene.board.showPhrase(0);
                }

            }

            if (this == this.scene.guillermo || this == this.scene.adso) {

                this.scene.sound.playAudioSprite('sound', 'pickup');

            }

            this.finishLeaveOrPickupItems();

            break;

        }
    }

    finishLeaveOrPickupItems() {
        this.canPickupItems = false;
        this.updateAuthDoors();
        this.scene.events.emit('updateobjects');

        if (this.pickupTimer) this.pickupTimer.destroy();
        this.pickupTimer = this.scene.time.delayedCall(3000, () => {this.canPickupItems = true}, [], this);
    }

    isCloseTo(actor) {

        if (this.floor != actor.floor) return false;

        const distX = this.distanceX(actor) + Actor.DISTANCE_OFFSETS[this.orientation][0];
        if ((distX < 0) || (distX >= Actor.DISTANCE_OFFSETS[this.orientation][1])) return false;

        const distY = this.distanceY(actor) + Actor.DISTANCE_OFFSETS[this.orientation][2];
        if ((distY < 0) || (distY >= Actor.DISTANCE_OFFSETS[this.orientation][3])) return false;

        return true;
    }

    inactive() {
        this.isActive = false;
        this.hide();
        this.updateActorHeight(0);
    }

    addTagEvent(id, delay, startAt = 0) {
        
        if (this.tagEvents[id]) return;

        this.tags[id] = false;
        this.tagEvents[id] = this.scene.time.addEvent({ delay, callback: () => this.tags[id] = true, callbackScope: this, startAt })

    }

    removeTagEvent(id) {
        if (!this.tagEvents[id]) return;
        
        this.tags[id] = false;
        this.tagEvents[id].remove();
        this.tagEvents[id] = null;
    }

    tagEventElapsedTime(id) {
        if (!this.tagEvents[id]) return 0;

        return this.tagEvents[id].elapsed;
    }

    pauseTagEvent(id) {
        if (!this.tagEvents[id]) return;

        this.tagEvents[id].paused = true;
    }

    resumeTagEvent(id) {
        if (!this.tagEvents[id]) return;

        this.tagEvents[id].paused = false;
    }

    flipped() {
        const adjustedOrientation = this.scene.camera.adjustOrientation(this.orientation);
        return adjustedOrientation == 2 || adjustedOrientation == 3;
    }
}

export default Actor;