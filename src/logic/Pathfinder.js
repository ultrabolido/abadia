import Actor from '../entities/Actor';
import Item from '../entities/Item';


class Pathfinder {
    
    static FLOOR_SIZE = 16;
    static ROOM_SIZE = 16;

    static INCREMENT_END_POSITIONS = [
        [  2,  0 ],
        [  0, -2 ],
        [ -2,  0 ],
        [  0,  2 ]
    ];

    static ROOM_END_POSTIONS = [
        [  0,  0, 0, 1 ],
        [  0, 15, 1, 0 ],
        [ 15,  0, 0, 1 ],
        [  0,  0, 1, 0 ]
    ];
    
    static DIRECTIONS = {
        RIGHT: 0x01,
        UP: 0x02,
        LEFT: 0x04,
        DOWN: 0x08,
        STAIRS_UP: 0x10,
        STAIRS_DOWN: 0x20
    };
    
    constructor(abadiaBuilder) {
        this.abadiaBuilder = abadiaBuilder;
    }

    getDirection(dx, dy) {
        const directions = {
            "1,0":  0,  
            "0,-1": 1,  
            "-1,0": 2, 
            "0,1": 3  
        };
        const key = `${dx},${dy}`;
        return directions[key];
    }

    getConnectedRooms(floor, roomX, roomY) {
        const connections = [];
        const room = this.abadiaBuilder.getRoomConnections(floor, roomX, roomY);
        
        // Check right connection
        if (((room & Pathfinder.DIRECTIONS.RIGHT) == 0) && (roomX < Pathfinder.FLOOR_SIZE - 1)) {
            connections.push({floor, roomX: roomX + 1, roomY});
        }

        // Check top connection
        if (((room & Pathfinder.DIRECTIONS.UP) == 0) && (roomY > 0)) {
            connections.push({floor, roomX, roomY: roomY - 1});
        }

        // Check left connection
        if (((room & Pathfinder.DIRECTIONS.LEFT) == 0) && (roomX > 0)) {
            connections.push({floor, roomX: roomX - 1, roomY});
        }

        // Check bottom connection
         if (((room & Pathfinder.DIRECTIONS.DOWN) == 0) && (roomY < Pathfinder.FLOOR_SIZE - 1)) {
            connections.push({floor, roomX, roomY: roomY + 1});
        }        
        
        // Check stairs connection
        if (((room & Pathfinder.DIRECTIONS.STAIRS_UP) == Pathfinder.DIRECTIONS.STAIRS_UP) && (floor < 2)) {
            connections.push({floor: floor + 1, roomX, roomY});
        }

        if (((room & Pathfinder.DIRECTIONS.STAIRS_DOWN) == Pathfinder.DIRECTIONS.STAIRS_DOWN) && (floor > 0)) {
            connections.push({floor: floor - 1, roomX, roomY});
        }
        
        return connections;
    }

    getWalkablePositions(floor, roomX, roomY, tileX, tileY ) {
        const connections = [];

        const height = this.abadiaBuilder.getHeight(floor, roomX, roomY, tileX, tileY);
        
        if (this.isWalkable(floor, roomX, roomY, tileX + 1, tileY, height)) {
            const coords = this.abadiaBuilder.normalizeCoordinates(roomX, roomY, tileX + 1, tileY);
            connections.push({floor, roomX: coords.rx, roomY: coords.ry, tileX: coords.x, tileY: coords.y});
        }

        if (this.isWalkable(floor, roomX, roomY, tileX, tileY - 1, height)) {
            const coords = this.abadiaBuilder.normalizeCoordinates(roomX, roomY, tileX, tileY - 1);
            connections.push({floor, roomX: coords.rx, roomY: coords.ry, tileX: coords.x, tileY: coords.y});
        }

        if (this.isWalkable(floor, roomX, roomY, tileX - 1, tileY, height)) {
            const coords = this.abadiaBuilder.normalizeCoordinates(roomX, roomY, tileX - 1, tileY);
            connections.push({floor, roomX: coords.rx, roomY: coords.ry, tileX: coords.x, tileY: coords.y});
        }

        if (this.isWalkable(floor, roomX, roomY, tileX, tileY + 1, height)) {
            const coords = this.abadiaBuilder.normalizeCoordinates(roomX, roomY, tileX, tileY + 1);
            connections.push({floor, roomX: coords.rx, roomY: coords.ry, tileX: coords.x, tileY: coords.y});
        }

        return connections;
    }

    isWalkable(floor, roomX, roomY, tileX, tileY, height) {

        const newHeight = this.abadiaBuilder.getHeight(floor, roomX, roomY, tileX, tileY);

        let diffHeight = height - newHeight + 1;

        if ((diffHeight < 0) || (diffHeight >= 3)) {
            return false;
        }

        if (newHeight != this.abadiaBuilder.getHeight(floor, roomX, roomY, tileX - 1, tileY)) {
            
            diffHeight = this.abadiaBuilder.getHeight(floor, roomX, roomY, tileX - 1, tileY) - newHeight + 1;
            if ((diffHeight < 0) || (diffHeight >= 3)) {
                return false;
            }

            if (newHeight != this.abadiaBuilder.getHeight(floor, roomX, roomY, tileX, tileY - 1)) {
                return false;
            }

            let diffHeight2 = this.abadiaBuilder.getHeight(floor, roomX, roomY, tileX - 1, tileY - 1) - newHeight + 1;
            if (diffHeight != diffHeight2) {
                return false;
            }

        } else {
            
            diffHeight = this.abadiaBuilder.getHeight(floor, roomX, roomY, tileX, tileY - 1) - newHeight + 1;
            if ((diffHeight < 0) || (diffHeight >= 3)) {
                return false;
            }

            let diffHeight2 = this.abadiaBuilder.getHeight(floor, roomX, roomY, tileX - 1, tileY - 1) - newHeight + 1;
            if (diffHeight != diffHeight2) {
                return false;
            }
        }

        return true;
    }

    findPath(start, end, generateAlternatives = true) {

        const endAlternatives = [];

        this.endDestination = null;
        this.sameRoom = this.isSameRoom(start, end);
        
        if (!this.sameRoom) {
            
            const startRoom = { floor: start.floor, roomX: start.room.x, roomY: start.room.y };
            const endRoom = { floor: end.floor, roomX: end.room.x, roomY: end.room.y };

            if (!this.isValidRoom(startRoom) || !this.isValidRoom(endRoom)) {
                return { reached: false, actions: [] };
            }

            endAlternatives[0] = [];

            const roomPath = this.findRoomPath(startRoom, endRoom);

            if (roomPath.length < 2) return { reached: false, actions: [] };
            
            const incFloor = roomPath[1].floor - roomPath[0].floor;

            if (incFloor != 0) {

                const targetHeight = (incFloor < 0) ? 0x01 : 0x0D;

                for (let tileY = 0; tileY < Pathfinder.ROOM_SIZE; tileY++) {

                    for (let tileX = 0; tileX < Pathfinder.ROOM_SIZE; tileX++) {

                        const height = this.abadiaBuilder.getHeight(start.floor, start.room.x, start.room.y, tileX, tileY);

                        if (height === targetHeight) {
                            endAlternatives[0].push({ floor: start.floor, roomX: start.room.x, roomY: start.room.y, tileX, tileY });
                        }
                    }

                }
                
            } else {

                const coordX = roomPath[1].roomX - roomPath[0].roomX;
                const coordY = roomPath[1].roomY - roomPath[0].roomY;

                const direction = this.getDirection(coordX, coordY);
                let tileX = Pathfinder.ROOM_END_POSTIONS[direction][0];
                let tileY = Pathfinder.ROOM_END_POSTIONS[direction][1];
                const incX = Pathfinder.ROOM_END_POSTIONS[direction][2];
                const incY = Pathfinder.ROOM_END_POSTIONS[direction][3];

                for (let i=0; i < Pathfinder.ROOM_SIZE; i++ ) {
                    endAlternatives[0].push({ floor: roomPath[1].floor, roomX: roomPath[1].roomX, roomY: roomPath[1].roomY, tileX, tileY });
                    tileX += incX;
                    tileY += incY;
                }

            }

        } else {

            let initialOrientation = 0;
            let oldOrientation = 0;

            if (!(end instanceof Actor) && !(end instanceof Item)) {
                endAlternatives.push([{ floor: end.floor, roomX: end.room.x, roomY: end.room.y, tileX: end.position.x, tileY: end.position.y, orientation: end.orientation }]);
                oldOrientation = end.orientation;
            } else {
                initialOrientation = end.orientation;
            }

            if (generateAlternatives) {

                for (let i=0; i < 4; i++) {
                    this.generateAlternatives(endAlternatives, end, (initialOrientation + i) & 0x03, oldOrientation);
                }

            }

        }
        
        const startPosition = { floor: start.floor, roomX: start.room.x, roomY: start.room.y, tileX: start.position.x, tileY: start.position.y};

        let path;
        let reached = false;
        let endPosition;

        this.abadiaBuilder.clearDoorHeight();

        for (let endAlternative of endAlternatives) {
            
            if (this.sameRoom && this.isSamePosition(startPosition, endAlternative[0])) {

                reached = true;
                endPosition = endAlternative[0];
                break;

            }
            
            path = this.findPositionPath(startPosition, endAlternative);
            if (path.length > 1) break;
        }

        this.abadiaBuilder.resetDoorHeight();

        let actions = [];

        if (reached) {

            if (start.orientation != endPosition.orientation) {

                actions = this.changeOrientation(start.orientation, endPosition.orientation);
    
            }

        } else {

            actions = this.generateActions(path, start.orientation);
        }

        return { reached, actions };
    
    }

    isSamePosition(a, b) {
        return a.tileX == b.tileX && a.tileY == b.tileY;
    }

    generateAlternatives(endAlternatives, end, orientation, oldOrientation) {

        const x = end.position.x + Pathfinder.INCREMENT_END_POSITIONS[orientation][0];
        const y = end.position.y + Pathfinder.INCREMENT_END_POSITIONS[orientation][1];
        if ((x < 0) || (x > 15) || (y < 0) || (y > 15)) return;

        const endHeight = this.abadiaBuilder.getHeight(end.floor, end.room.x, end.room.y, x, y);
        const diffHeight = end.height - endHeight + 1;

        if ( Math.abs(diffHeight) > 5 ) return;

        const newOrientation = (orientation ^ 0x02) | oldOrientation;

        endAlternatives.push([{ floor: end.floor, roomX: end.room.x, roomY: end.room.y, tileX: x, tileY: y, orientation: newOrientation }]);

    }

    generateActions(path, initialOrientation) {

        if (path.length < 2) return [];

        const actions = [];

        let position = path.shift();
        let orientation = initialOrientation;

        while (path.length > 0) {
            
            const nextPosition = path.shift();

            const coordX = nextPosition.tileX - position.tileX;
            const coordY = nextPosition.tileY - position.tileY;

            const coords = this.normalizeCoordinates(coordX, coordY);

            const direction = this.getDirection(coords.x, coords.y);

            actions.push(...this.changeOrientation(orientation, direction));
            this.saveAction(actions, Actor.Action.WALK);
            
            orientation = direction;
            position = nextPosition;
            
        }
        
        return actions;
    }

    normalizeCoordinates(x, y) {

        if (x == 15) x = -1;
        if (x == -15) x = 1;
        if (y == 15) y = -1;
        if (y == -15) y = 1;

        return {x, y};
    }

    saveAction(actions, actionType) {
        if ((actions.length > 0 ) && ( actions[actions.length - 1].action === actionType )) {
            actions[actions.length - 1].times++;
        } else {
            actions.push({ action: actionType, times: 1});
        }
    }

    changeOrientation(originalOrientation, targetOrientation) {
       
        const actions = [];

        let numTurns = targetOrientation - originalOrientation;
    
        if (numTurns > 2) numTurns -= 4;
        if (numTurns < -2) numTurns += 4;
        
        if (numTurns > 0) {
            for (let i = 0; i < numTurns; i++) {
                this.saveAction(actions, Actor.Action.TURN_LEFT);
                this.saveAction(actions, Actor.Action.STOP);
            }
        } else if (numTurns < 0) {
            for (let i = 0; i < Math.abs(numTurns); i++) {
                this.saveAction(actions, Actor.Action.TURN_RIGHT);
                this.saveAction(actions, Actor.Action.STOP);
            }
        }

        return actions;
    }

    findRoomPath(start, end) {
        if (!this.isValidRoom(start) || !this.isValidRoom(end)) {
            return [];
        }

        const reverse = (start.floor == end.floor);
        if (reverse) [ start, end ] = [ end, start ];

        
        const previous = new Map();
        const visited = new Set();
        const queue = [];
        
        const startKey = this.getRoomKey(start.floor, start.roomX, start.roomY);
        visited.add(startKey);
        previous.set(startKey, null);
        queue.push(start);

        while (queue.length > 0) {
            const current = queue.shift();
            
            if (((start.floor != end.floor) && (current.floor == end.floor)) || 
                ((Math.abs(start.floor - end.floor) == 2) && (current.floor == 1))) {
                end = current;
                break;
            }

            if (current.floor === end.floor && 
                current.roomX === end.roomX && 
                current.roomY === end.roomY) {
                break;
            }

            const neighbors = this.getConnectedRooms(current.floor, current.roomX, current.roomY);
            
            for (const neighbor of neighbors) {
                const neighborKey = this.getRoomKey(neighbor.floor, neighbor.roomX, neighbor.roomY);
                
                if (!visited.has(neighborKey)) {
                    visited.add(neighborKey);
                    previous.set(neighborKey, this.getRoomKey(current.floor, current.roomX, current.roomY));
                    queue.push(neighbor);
                }
            }
        }

        return this.reconstructRoomPath(previous, start, end, reverse);
    }

    reconstructRoomPath(previous, start, end, reverse = false) {
        const path = [];
        let current = this.getRoomKey(end.floor, end.roomX, end.roomY);
        const startKey = this.getRoomKey(start.floor, start.roomX, start.roomY);

        if (!previous.has(current)) {
            return [];
        }

        while (current) {
            const [floor, roomX, roomY] = current.split(',').map(Number);
            if (reverse) {
                path.push({floor, roomX, roomY});
            } else {
                path.unshift({floor, roomX, roomY});
            }
            
            if (current === startKey) break;
            current = previous.get(current);
        }

        return path;
    }

    findPositionPath(start, ends) {

        if (ends.length == 0) return [];

        let end = null;
        let iteration = 0;

        const previous = new Map();
        const iterations = new Map();
        const visited = new Set();
        const queue = [];
        
        const startKey = this.getPositionKey(start.roomX, start.roomY, start.tileX, start.tileY);
        visited.add(startKey);
        previous.set(startKey, null);
        iterations.set(startKey, iteration);
        queue.push(start);
        queue.push(null);

        while (queue.length > 0) {
            const current = queue.shift();

            if (current === null) {

                if (queue.length == 0) return [];
                iteration++;
                queue.push(null);
                continue;
            }

            const neighbors = this.getWalkablePositions(start.floor, current.roomX, current.roomY, current.tileX, current.tileY);
            
            for (const neighbor of neighbors) {
                const neighborKey = this.getPositionKey(neighbor.roomX, neighbor.roomY, neighbor.tileX, neighbor.tileY);
                
                if (!this.isValidPositionInRoom(start.roomX, start.roomY, neighbor)) continue;

                if (!visited.has(neighborKey)) {
                    
                    visited.add(neighborKey);
                    iterations.set(neighborKey, iteration);
                    previous.set(neighborKey, this.getPositionKey(current.roomX, current.roomY, current.tileX, current.tileY));
                    queue.push(neighbor);

                } else {

                    if (iterations.get(neighborKey) == iteration) {

                        previous.set(neighborKey, this.getPositionKey(current.roomX, current.roomY, current.tileX, current.tileY));

                    }
                    
                }

                end = ends.find(end => (
                    (neighbor.roomX === end.roomX && neighbor.roomY === end.roomY && neighbor.tileX === end.tileX && neighbor.tileY === end.tileY)
                ));
    
                if (end) {
                    this.endDestination = end;
                    return this.reconstructPositionPath(previous, start, end);
                }

            }

        }

        return [];

    }

    isValidPositionInRoom(roomX, roomY, position) {
        if ((position.roomX < roomX) && ( position.tileX < 14 )) return false;
        if ((position.roomX > roomX) && ( position.tileX > 1 )) return false;
        if ((position.roomY < roomY) && ( position.tileY < 14 )) return false;
        if ((position.roomY > roomY) && ( position.tileY > 1 )) return false;

        return true;
    }
    
    reconstructPositionPath(previous, start, end) {

        const path = [];

        if (!end) return [];

        let current = this.getPositionKey(end.roomX, end.roomY, end.tileX, end.tileY);
        const startKey = this.getPositionKey(start.roomX, start.roomY, start.tileX, start.tileY);

        if (!previous.has(current)) {
            return [];
        }

        while (current) {
            const [roomX, roomY, tileX, tileY] = current.split(',').map(Number);
            path.unshift({roomX, roomY, tileX, tileY});
            
            if (current === startKey) break;
            current = previous.get(current);
        }

        return path;
    }

    getRoomKey(floor, roomX, roomY) {
        return `${floor},${roomX},${roomY}`;
    }

    getPositionKey(roomX, roomY, tileX, tileY) {
        return `${roomX},${roomY},${tileX},${tileY}`;
    }

    isValidRoom(position) {
        const {floor, roomX, roomY} = position;
        return roomX >= 0 && roomX < Pathfinder.FLOOR_SIZE && 
               roomY >= 0 && roomY < Pathfinder.FLOOR_SIZE &&
               floor >=0 && floor < 3 &&
               this.abadiaBuilder.getRoomConnections(floor, roomX, roomY) !== 0x0F;
    }

    isSameRoom(start, end) {
        return (start.floor == end.floor) && (start.room.x == end.room.x) && (start.room.y == end.room.y);
    }

    printPath(path) {
        if (!path.length) return "No hay camino posible";
        return path.map(pos => `(${pos.floor},${pos.roomX},${pos.roomY})`).join(" -> ");
    }

    printActions(actions) {
        return actions.map( act => `(${act.action},${act.times})`).join(" -> ");
    }

    printPositionPath(path) {
        if (!path.length) return "No hay camino posible";
        return path.map(pos => `(${pos.roomX},${pos.roomY},${pos.tileX},${pos.tileY})`).join(" -> ");
    }

}

export default Pathfinder;