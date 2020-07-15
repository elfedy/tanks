// TYPES
type Color = {
  r: number,
  g: number,
  b: number,
  alpha: number,
}

type Vector2 = {
  x: number,
  y: number,
}

type Tank = {
  tankType: string,
  position: Vector2,
  direction: string,
  speed: number,
  bullet: Bullet,
  bulletSpeed: number,
  player: boolean,
  wasDestroyed: boolean,
  id: number,
}

type Bullet = {
  vx: number,
  vy: number,
  width: number,
  height: number,
  position: Vector2, 
  collided: boolean,
}

window.onload = run; 

function run() {
  var canvas = <HTMLCanvasElement> document.getElementById('canvas');
  var gl = canvas.getContext('webgl');


  // tile map: 640 x 480 means 24 rows of 32 tiles for 20 x 20 tiles

  var tileMap = [ 
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','s','s','x','g','g','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'b','b','x','x','b','b','x','x','b','b','x','x','b','b','x','x','s','s','b','g','g','b','b','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','x','x','b','b','x','x','b','b','x','x','b','b','x','x','x','x','x','x','x','b','b','b','b','b','b','b','b','b','b','b'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','x','x','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','x','x','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','x','x','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','x','x','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','x','x','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','x','x','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','w','w','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','x','x','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','w','w','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','x','x','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','x','x','b','b','b','b','b','b','b','b','b'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','w','w'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','w','w'],
    [ 'b','b','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','s','s'],
    [ 'b','b','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','s','s']
  ]


  if(gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  // SHADERS
  var vsSource = `
    attribute vec2 aPosition;
    uniform mat3 uMatrix;
    
    void main() {
      gl_Position = vec4((uMatrix * vec3(aPosition, 1)).xy, 0, 1);
    }
  `

  var fsSource = `
    precision mediump float;

    uniform vec4 uColor;

    void main() {
      gl_FragColor = uColor;
    }
  `

  // WEBGL SETUP

  // Compile and use shader program
  var shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  gl.useProgram(shaderProgram);

  // Get shader variable locations
  var glLocations = {
    aPosition: gl.getAttribLocation(shaderProgram, "aPosition"),
    uColor: gl.getUniformLocation(shaderProgram, "uColor"),
    uMatrix: gl.getUniformLocation(shaderProgram, "uMatrix"),
  };

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Create and bind buffer to the position attribute
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(glLocations.aPosition);

  // Tell the attribute how to get data out of positionBuffer (ARRAY BUFFER)
  var size = 2; // 2 components per iteration
  var dataType = gl.FLOAT;
  var normalize = false;
  var stride = 0; // stride is bytes between beggining of consecutive vertex attributes in buffer. 0 means
                  // tightly packed (one begins when the previous one ends with no space in between)
  var offset = 0; // start at the begining of the buffer

  gl.vertexAttribPointer(glLocations.aPosition, size, dataType, normalize, stride, offset);

// Ids for entities
  var entityIds = {
    current: 0,
    create: function(): number {
      var prev = this.current;
      this.current++;
      return prev;
    },
  }

  var playerSpawnPosition =  {
    x: 200,
    y: 440, 
  }

  // GAME SETUP
  var Game = {
    // Runtime
    tLastRender: performance.now(),
    running: true,

    // Level
    levelWidth: gl.canvas.width,
    levelHeight: gl.canvas.height,
    tileWidth: 20,
    tileHeight: 20,
    tileRows: tileMap.length,
    tileCols: tileMap[0].length,

    // Input
    arrowDownIsPressed: false,
    arrowUpIsPressed:false,
    arrowRightIsPressed: false,
    arrowLeftIsPressed:false,
    lastDirectionPressed: null,

    spaceIsPressed: false,
    spaceWasPressed: false,

    entityIds: entityIds,

    // Player
    playerLives: 3,
    playerSpawnPosition: playerSpawnPosition,
    playerColor: {
      r: 0.1,
      g: 0.8,
      b: 0.5,
      alpha: 1.0,
    },
    playerTank: {
      tankType: 'playerNormal',
      position: { x: playerSpawnPosition.x, y: playerSpawnPosition.y },
      direction: "up",
      speed: 200,
      bullet: null,
      bulletSpeed: 800,
      player: true,
      wasDestroyed: false,
      id: entityIds.create(),
    },

    // Enemies
    enemyColor: {
      r: 0.8,
      g: 0.2,
      b: 0.1,
      alpha: 1.0,
    },
    enemies: [
      {
        tank: {
          tankType: 'enemyNormal',
          position: {
            x: 600,
            y: 40,
          },
          direction: 'down',
          speed: 200,
          bullet: null,
          bulletSpeed: 800,
          player: false,
          wasDestroyed: false,
          id: entityIds.create()
        },
        nextDirection: null,
      },
      {
        tank: {
          tankType: 'enemyNormal',
          position: {
            x: 500,
            y: 40,
          },
          direction: 'down',
          speed: 200,
          bullet: null,
          bulletSpeed: 800,
          player: false,
          wasDestroyed: false,
          id: entityIds.create(),
        },
        nextDirection: null,
      },
      {
        tank: {
          tankType: 'enemyNormal',
          position: {
            x: 400,
            y: 40,
          },
          direction: 'down',
          speed: 200,
          bullet: null,
          bulletSpeed: 800,
          player: false,
          wasDestroyed: false,
          id: entityIds.create(),
        },
        nextDirection: null,
      }
    ],

    // Other Entities
    bulletColor: {
      r: 1,
      g: 1,
      b: 1,
      alpha: 1.0,
    },
    tiles: tileMap, 
  }

  // EVENT LISTENERS
  document.addEventListener('keydown', function(e) {
    switch(e.code) {
      case 'ArrowUp': {
        Game.arrowUpIsPressed = true;
        Game.lastDirectionPressed = "up";
      } break;
      case 'ArrowDown': {
        Game.arrowDownIsPressed = true;
        Game.lastDirectionPressed = "down";
      } break;
      case 'ArrowRight': {
        Game.arrowRightIsPressed = true;
        Game.lastDirectionPressed = "right";
      } break;
      case 'ArrowLeft': {
        Game.arrowLeftIsPressed = true;
        Game.lastDirectionPressed = "left";
      } break;
      case 'Space': {
        Game.spaceIsPressed = true;
      } break;
      case 'KeyP': {
        if(Game.running) {
          Game.running = false;
        } else {
          Game.running = true;
          Game.tLastRender = performance.now(),
          requestAnimationFrame(main);
        }
      } break;
    }
  })

  document.addEventListener('keyup', function(e) {
    switch(e.code) {
      case 'ArrowUp': {
        Game.arrowUpIsPressed = false;
      } break;
      case 'ArrowDown': {
        Game.arrowDownIsPressed = false;
      } break;
      case 'ArrowRight': {
        Game.arrowRightIsPressed = false;
      } break;
      case 'ArrowLeft': {
        Game.arrowLeftIsPressed = false;
      } break;
      case 'Space': {
        Game.spaceIsPressed = false;
      } break;
    }
  })

  // Define main loop
  function main(tFrame) {
    // Clear the canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    /*
     * UPDATE 
     */
    var dt = tFrame - Game.tLastRender;

    if(Game.playerTank.wasDestroyed) {
      Game.playerLives--;
      if(Game.playerLives >= 0) {
        Game.playerTank.position = vec2.copy(Game.playerSpawnPosition); 
        Game.playerTank.wasDestroyed = false;
      } else {
        alert("Game Over");
        return;
      }
    } else {
      var isMoving = false;

      // Check Player direction and movement
      if(Game.lastDirectionPressed) {
        var pressedDirections = [];
        if(Game.arrowUpIsPressed) { pressedDirections.push("up") };
        if(Game.arrowDownIsPressed) { pressedDirections.push("down") };
        if(Game.arrowLeftIsPressed) { pressedDirections.push("left") };
        if(Game.arrowRightIsPressed) { pressedDirections.push("right") };

        if(pressedDirections.length > 0) {
          isMoving = true;
          if(pressedDirections.indexOf(Game.lastDirectionPressed) !== -1) {
            Game.playerTank.direction = Game.lastDirectionPressed;
          } else {
            // Pick one of the pressed directions
            Game.playerTank.direction = pressedDirections.pop();
          }
        } else {
          Game.playerTank.direction = Game.lastDirectionPressed;
        }
      }

      if(isMoving) {
        var playerMovement =
          tankComputeMovementInDirection(Game, Game.playerTank, dt)
        Game.playerTank.position = playerMovement.newPosition;
      }
    }

    // Update enemies position
    for(var i = 0; i < Game.enemies.length; i++) {
      var enemy = Game.enemies[i];
      if(enemy.tank.wasDestroyed) {
        Game.enemies.splice(i, 1);
        i--;
        break;
      }

      if(enemy.nextDirection) {
        enemy.tank.direction = enemy.nextDirection;
        enemy.nextDirection = null;
        break;
      }

      var enemyMovement = tankComputeMovementInDirection(Game, enemy.tank, dt);
      enemy.tank.position = enemyMovement.newPosition;

      if(enemyMovement.collisions.length > 0) {
        var newIndex = Math.floor(Math.random() * 4);
        enemy.nextDirection = ['up', 'down', 'right', 'left'][newIndex];
      }
    }

    // Update player bullet position
    if(Game.playerTank.bullet) {
      bulletUpdate(Game.playerTank, Game, dt);
    }

    // Update enemies bullet position
    Game.enemies.forEach(function(enemy) {
      if(enemy.tank.bullet) {
        bulletUpdate(enemy.tank, Game, dt);
      }
    });

    // Player Bullet Firing
    if(Game.spaceIsPressed && !Game.spaceWasPressed && !Game.playerTank.bullet) {
      bulletCreate(Game.playerTank);
    };

    // Enemy Bullet Firing
    Game.enemies.forEach(function(enemy) {
      // TODO(Fede): This determines every frame if bullet will fire or not
      // That will make fire rate dependent of the frame rate, so maybe the randomness
      // should be about how many seconds will pass in order for the bullet to be fired
      if(!enemy.tank.bullet) {
        if(Math.random() > 0.95) {
          bulletCreate(enemy.tank);
        }
      }
    })

    // Draw Player
    tankDraw(
      gl,
      glLocations,
      Game.playerColor,
      Game.playerTank
    )

    // Draw Enemies
    Game.enemies.forEach(function(enemy) {
      tankDraw(
        gl,
        glLocations,
        Game.enemyColor,
        enemy.tank
      )
    })
      

    // Draw Tile
    var tileColors = {
      b: {
        r: 0.67,
        g: 0.38,
        b: 0.3,
        alpha: 1.0,
      },
      s: {
        r: 0.8,
        g: 0.8,
        b: 0.8,
        alpha: 1.0,
      },
      g: {
        r: 0.4,
        g: 0.6,
        b: 0.1,
        alpha: 0.5,
      },
      w: {
        r: 0.05,
        g: 0.05,
        b: 0.6,
        alpha: 0.5,
      },
    };

    for(var i = 0; i < Game.tileRows; i++) {
      for(var j = 0; j < Game.tileCols; j++) {
        var tile = Game.tiles[i][j];
        if(tile !== 'x') {
          drawRectangle(
            gl,
            glLocations,
            tileColors[tile],
            Game.tileWidth,
            Game.tileHeight,
            Math.floor(j * Game.tileWidth + Game.tileWidth / 2),
            Math.floor(i * Game.tileHeight + Game.tileHeight / 2),
          );
        }
      }
    }

    // DrawBullets
    if(Game.playerTank.bullet) {
      bulletDraw(gl, glLocations, Game, Game.playerTank.bullet);
    }

    Game.enemies.forEach(function(enemy) {
      if(enemy.tank.bullet) {
        bulletDraw(gl, glLocations, Game, enemy.tank.bullet);
      }
    });

    // Store input state
    Game.spaceWasPressed = Game.spaceIsPressed;

    Game.tLastRender = tFrame;

    if(Game.running) {
      requestAnimationFrame(main);
    }
  };

  // Run the main Loop
  requestAnimationFrame(main);
}

// ENTITY DATA

// Tank
function tankGetData(tankType: string) {
    var data =  {
      playerNormal: {
        width: 40,
        height: 40,
        defaultSpeed: 300,
      },
      enemyNormal: {
        width: 40,
        height: 40,
        defaultSpeed: 300,
      },
    }[tankType]

    return data;
}

// GAME UPDATE

function pickPlayerDirection(Game) {
  if(Game.arrowRightIsPressed) {
    Game.playerDirection = "right";
  } else if(Game.arrowLeftIsPressed) {
    Game.playerDirection = "left";
  } else if(Game.arrowUpIsPressed) {
    Game.playerDirection = "up";
  } else if(Game.arrowDownIsPressed) {
    Game.playerDirection = "down";
  } else {
    Game.playerDirection = Game.playerDirection;
  }
}

//NOTE(Fede) Asumes tank is effectively moving in its direction
function tankEstimateMovement(tank: Tank, dt: number) : Vector2 {
  var dx = 0;
  var dy = 0;
  if(tank.direction === "right") {
    dx += Math.floor(tank.speed * dt / 1000);
  } else if(tank.direction === "left") {
    dx -= Math.floor(tank.speed * dt / 1000);
  } else if(tank.direction === "up") {
    dy -= Math.floor(tank.speed * dt / 1000);
  } else if(tank.direction === "down") {
    dy += Math.floor(tank.speed * dt / 1000);
  }

  return {
    x: dx,
    y: dy,
  };
}

function tankComputeMovementInDirection(Game, tank: Tank, dt: number) {
  var tankData = tankGetData(tank.tankType);
  var collisions = [];
  var movementEstimate = tankEstimateMovement(tank, dt);

  var newPosition = 
    {
      x: tank.position.x + movementEstimate.x,
      y: tank.position.y + movementEstimate.y,
    };

  var isVertical = tank.direction === "up" || tank.direction === "down";
  var relativeWidth = isVertical ? tankData.width : tankData.height;
  var relativeHeight = isVertical ? tankData.height : tankData.width;

  var boundaries =
    getRectangleBoundaries(
      newPosition,
      relativeWidth,
      relativeHeight
    );

  var screenLimitsCollisions = 
    rectangleBoundariesCollisionsScreenLimits(
      Game, boundaries, newPosition, relativeWidth, relativeHeight);
  boundaries = screenLimitsCollisions.boundaries;
  newPosition = screenLimitsCollisions.position;
  collisions = collisions.concat(screenLimitsCollisions.collisions);

  var tileCollisions = 
    rectangleBoundariesCollisionsTiles(
      Game, boundaries, newPosition, movementEstimate, relativeWidth, relativeHeight, ["b", "s", "w"]);
  boundaries = tileCollisions.boundaries;
  newPosition = tileCollisions.position;
  collisions = collisions.concat(tileCollisions.collisions);

  // Tank Collisions
  var enemyTanks = Game.enemies.map(e => e.tank);
  var otherTanks = [Game.playerTank].concat(enemyTanks);
  var tankCollisions = [];
  otherTanks.forEach(function(otherTank) {
    if(otherTank.id !== tank.id) {
      var otherTankData = tankGetData(otherTank.tankType);
      var otherTankBoundaries = 
        getRectangleBoundaries(otherTank.position, otherTankData.width, otherTankData.height)

      if(rectangleBoundariesAreColliding(boundaries, otherTankBoundaries)) {
        tankCollisions.push({entity: 'tank', metadata: {boundaries: otherTankBoundaries}})
      }
    }
  })

  if(tankCollisions.length > 0) {
    newPosition = vec2.copy(tank.position);
  }
  boundaries = getRectangleBoundaries(newPosition, relativeHeight, relativeWidth);
  collisions = collisions.concat(tankCollisions);

  return {
    newPosition: newPosition,
    collisions: collisions,
  }
}

function bulletCreate(tank: Tank) {
    var vx = 0;
    var vy = 0;
    var bulletSpeed = tank.bulletSpeed;

    switch(tank.direction) {
      case "up": {
        vy = -bulletSpeed;
      } break;
      case "down": {
        vy = bulletSpeed;
      } break;
      case "left": {
        vx = -bulletSpeed;
      } break;
      case "right": {
        vx = bulletSpeed;
      } break;
    }

    tank.bullet =  {
      vx: vx,
      vy: vy,
      width: 10,
      height: 10,
      position: {
        x: tank.position.x,
        y: tank.position.y,
      },
      collided: false,
    };
}

function bulletUpdate(tank: Tank, Game, dt) {
  var bullet = tank.bullet;
  if(!bullet) { 
    return;
  }
  if(bullet.collided) {
    tank.bullet = null;
    return;
  }
  var movementEstimate = {
    x: Math.round(bullet.vx * dt / 1000),
    y: Math.round(bullet.vy * dt / 1000),
  }
  var newPosition = {
    x: Math.round(bullet.position.x + movementEstimate.x),
    y: Math.round(bullet.position.y + movementEstimate.y),
  }
  var collisions = [];
  var relativeWidth;
  var relativeHeight;
  if(bullet.vy > 0) {
    relativeWidth = bullet.width;
    relativeHeight = bullet.height;
  } else {
    relativeWidth = bullet.height;
    relativeHeight = bullet.width;
  }

  var boundaries = getRectangleBoundaries(newPosition, relativeWidth, relativeHeight);

  var screenLimitsCollisions = 
    rectangleBoundariesCollisionsScreenLimits(
      Game, boundaries, newPosition, relativeWidth, relativeHeight);
  boundaries = screenLimitsCollisions.boundaries;
  newPosition = screenLimitsCollisions.position;
  collisions = collisions.concat(screenLimitsCollisions.collisions);

  var tileCollisions = 
    rectangleBoundariesCollisionsTiles(
      Game, boundaries, newPosition, movementEstimate, relativeWidth, relativeHeight, ["b", "s"]);
  boundaries = tileCollisions.boundaries;
  newPosition = tileCollisions.position;
  collisions = collisions.concat(tileCollisions.collisions);

  // Destroy tiles
  tileCollisions.collisions.forEach(function(tileCollision) {
    if(tileCollision.metadata.tile === "b") {
      Game.tiles[tileCollision.metadata.row][tileCollision.metadata.col] = 'x';
    }
  })

  if(tank.player) {
    Game.enemies.forEach(function(enemy) {
      var tankData = tankGetData(enemy.tank.tankType);
      var relativeWidth;
      var relativeHeight;
      if(enemy.tank.direction === "up" || enemy.tank.direction === "down") {
        relativeWidth = tankData.width;
        relativeHeight = tankData.height;
      } else {
        relativeWidth = tankData.height;
        relativeHeight = tankData.width;
      }
      if(rectangleBoundariesAreColliding(
        boundaries,
        getRectangleBoundaries(enemy.tank.position, relativeWidth, relativeHeight))
      ) {
        enemy.tank.wasDestroyed = true;
        collisions.push({entity: "tank"})
      }
    })
  } else {
    let tankData = tankGetData(Game.playerTank.tankType);
    let relativeWidth;
    let relativeHeight;
    if(Game.playerTank.direction === "up" || Game.playerTank.direction === "down") {
      relativeWidth = tankData.width;
      relativeHeight = tankData.height;
    } else {
      relativeWidth = tankData.height;
      relativeHeight = tankData.width;
    }

    if(rectangleBoundariesAreColliding(
      boundaries,
      getRectangleBoundaries(Game.playerTank.position, relativeWidth, relativeHeight))
    ) {
      Game.playerTank.wasDestroyed = true;
      collisions.push({entity: "tank"})
    }
  }

  bullet.position = newPosition;
  if(collisions.length > 0) {
    // Remove Bullet
    tank.bullet.collided = true;
  }
}

type RectangleBoundaries = {
  top: number,
  bottom: number,
  right: number,
  left: number,
};

function rectangleBoundariesAreColliding(a: RectangleBoundaries, b: RectangleBoundaries)
: boolean
{
  return !(a.top >= b.bottom || a.bottom <= b.top || a.right <= b.left || a.left >= b.right);
}

// NOTE(Fede): width and height are relative to the x and y axis.
function getRectangleBoundaries(position: Vector2, width: number, height: number) : RectangleBoundaries {
  return {
    top: position.y - height / 2,
    bottom: position.y + height / 2,
    right: position.x + width / 2,
    left: position.x - width / 2,
  };
};

function rectangleBoundariesCollisionsScreenLimits(Game, boundaries: RectangleBoundaries, position: Vector2, width, height) {
  var minX = Math.round(width / 2);
  var maxX = Math.round(Game.levelWidth - width / 2);
  var minY = Math.round(height / 2);
  var maxY = Math.round(Game.levelHeight - height / 2);
  var newPosition = {x: position.x, y: position.y};
  var collisions = [];

  if(newPosition.x < minX) {
    newPosition.x = minX;
    collisions.push({entity: 'screenLimit'});
  }
  if(newPosition.x > maxX) {
    newPosition.x = maxX;
    collisions.push({entity: 'screenLimit'});
  }
  if(newPosition.y < minY) {
    newPosition.y = minY;
    collisions.push({entity: 'screenLimit'});
  }
  if(newPosition.y > maxY) {
    newPosition.y = maxY;
    collisions.push({entity: 'screenLimit'});
  }

  var newBoundaries =
    getRectangleBoundaries(
      newPosition,
      width,
      height
    );
  
  return {
    boundaries: newBoundaries,
    position: newPosition,
    collisions: collisions,
  }
}

function rectangleBoundariesCollisionsTiles(Game, boundaries: RectangleBoundaries, position: Vector2, movement: Vector2, width, height, targetTiles: string[]) {
  var collisions = [];
  var newPosition = {x: position.x, y: position.y};

  var isTargetTile = function(tile) { return targetTiles.indexOf(tile) !== -1 }

  // check collision to the right
  if(movement.x > 0) {
    var col = Math.min(Math.floor((boundaries.right) / Game.tileWidth), Game.tileCols - 1);
    var topRow = Math.floor((boundaries.top + 1) / Game.tileHeight);
    var centerRow = Math.floor(newPosition.y / Game.tileHeight);
    var bottomRow = Math.floor((boundaries.bottom - 1) / Game.tileHeight);

    var collided = false;
    arrayUnique([topRow, centerRow, bottomRow]).forEach(function(row) {
      var tile = Game.tiles[row][col];
      if(isTargetTile(tile)) {
        collided = true;
        collisions.push({entity: 'tile', metadata: {tile: tile, col: col, row: row}})
      }
    });

    if(collided) {
      newPosition.x = Math.round((col) * Game.tileWidth - width / 2);
    }
  }

  // check collision to the left
  if(movement.x < 0) {
    var col = Math.floor(boundaries.left / Game.tileWidth);
    var topRow = Math.floor((boundaries.top + 1) / Game.tileHeight);
    var centerRow = Math.floor(newPosition.y / Game.tileHeight);
    var bottomRow = Math.floor((boundaries.bottom - 1) / Game.tileHeight);

    var collided = false;
    arrayUnique([topRow, centerRow, bottomRow]).forEach(function(row) {
      var tile = Game.tiles[row][col];
      if(isTargetTile(tile)) {
        collided = true;
        collisions.push({entity: 'tile', metadata: {tile: tile, col: col, row: row}})
      }
    });

    if(collided) {
      newPosition.x = Math.round((col + 1) * Game.tileWidth + width / 2);
    }
  }

  // check collision going down 
  if(movement.y > 0) {
    var row = Math.min(Math.floor(boundaries.bottom / Game.tileHeight), Game.tileRows - 1);
    var leftCol = Math.floor((boundaries.left + 1) / Game.tileWidth);
    var centerCol = Math.floor(newPosition.x / Game.tileWidth);
    var rightCol = Math.floor((boundaries.right - 1) / Game.tileWidth);

    var collided = false;
    arrayUnique([leftCol, centerCol, rightCol]).forEach(function(col) {
      var tile = Game.tiles[row][col];
      if(isTargetTile(tile)) {
        collided = true;
        collisions.push({entity: 'tile', metadata: {tile: tile, col: col, row: row}})
      }
    });

    if(collided) {
      newPosition.y = Math.round((row) * Game.tileHeight - height / 2);
    }
  }

  // check collision going up 
  if(movement.y < 0) {
    var row = Math.floor(boundaries.top / Game.tileHeight);
    var leftCol = Math.floor((boundaries.left + 1) / Game.tileWidth);
    var centerCol = Math.floor(newPosition.x / Game.tileWidth);
    var rightCol = Math.floor((boundaries.right - 1) / Game.tileWidth);

    var collided = false;
    arrayUnique([leftCol, centerCol, rightCol]).forEach(function(col) {
      var tile = Game.tiles[row][col];
      if(isTargetTile(tile)) {
        collided = true;
        collisions.push({entity: 'tile', metadata: {tile: tile, col: col, row: row}})
      }
    });

    if(collided){
      newPosition.y = Math.round((row + 1) * Game.tileHeight + height / 2);
    }
  }

  var newBoundaries = getRectangleBoundaries(newPosition, width, height);

  var result =  {
    boundaries: newBoundaries,
    position: newPosition,
    collisions: collisions,
  }

  return result;
}

// DRAW UTILS

//NOTE(Fede): x and y mean the top left of the rectangle here, contrary to what is used
// to position entities. Then this rectangle is translated using a translation
// matrix with x, y relative to the center of the rectangle. Maybe I should change this
// here but it makes the vertex calculation more straightforward
function squareVertices(width: number, height: number, x: number, y: number): number[] {
  return [
    x, y,
    x, y + height,
    x + width, y + height,
    x, y,
    x + width, y,
    x + width, y + height,
  ]
}

function drawRectangle(gl, glLocations, color: Color, width, height, x, y)
{
    // Set matices
    var matrixProjection = mat3.projection(gl.canvas.width, gl.canvas.height);
    var matrixChangeOrigin = mat3.translation(-width / 2, -height / 2);
    var matrixTranslation = mat3.translation(x, y);
    var matrix = mat3.identity()
    matrix = mat3.multiply(matrix, matrixProjection);
    matrix = mat3.multiply(matrix, matrixTranslation);
    matrix = mat3.multiply(matrix, matrixChangeOrigin);
    gl.uniformMatrix3fv(glLocations.uMatrix, false, matrix);

    // Add vertices to array buffer (Requires a buffer to been previously bound to gl.ARRAY_BUFFER)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertices(width, height, 0, 0)), gl.STATIC_DRAW);

    // Define and set color for rectangle
    var colorArray = [color.r, color.g, color.b, color.alpha]
    gl.uniform4fv(glLocations.uColor, colorArray);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

function tankDraw(gl, glLocations, color, tank) {
    var tankData = tankGetData(tank.tankType);
    // Rotation angle
    var theta = 0;
    switch(tank.direction) {
      case('down'):
        theta = Math.PI;
        break;
      case('right'):
        theta = 3 / 2 * Math.PI;
        break;
      case('left'):
        theta = Math.PI / 2;
        break;
    }

    // Set matices
    var matrixProjection = mat3.projection(gl.canvas.width, gl.canvas.height);
    var matrixChangeOrigin = mat3.translation(-tankData.width / 2, -tankData.height / 2);
    var matrixRotation = mat3.rotation(theta)
    var matrixTranslation = mat3.translation(tank.position.x, tank.position.y);
    var matrix = mat3.identity()
    matrix = mat3.multiply(matrix, matrixProjection);
    matrix = mat3.multiply(matrix, matrixTranslation);
    matrix = mat3.multiply(matrix, matrixRotation);
    matrix = mat3.multiply(matrix, matrixChangeOrigin);
    gl.uniformMatrix3fv(glLocations.uMatrix, false, matrix);

    // Add vertices to array buffer (Requires a buffer to been previously bound to gl.ARRAY_BUFFER)
    var bodyVertices = squareVertices(tankData.width, tankData.height * 3 / 4, 0, tankData.height * 1 / 4);
    var cannonVertices = squareVertices(tankData.width / 4, tankData.height, tankData.width * 3 / 8, 0);
    var tankVertices = bodyVertices.concat(cannonVertices)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tankVertices), gl.STATIC_DRAW);

    // Define and set color for rectangle
    var colorArray = [color.r, color.g, color.b, color.alpha]
    gl.uniform4fv(glLocations.uColor, colorArray);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 12;
    gl.drawArrays(primitiveType, offset, count);
}

function bulletDraw(gl, glLocations, Game, bullet: Bullet) {
    drawRectangle(
      gl,
      glLocations,
      Game.bulletColor,
      bullet.width,
      bullet.height,
      bullet.position.x,
      bullet.position.y
    )
}

// SHADER MANAGEMENT
function initShaderProgram(gl, vsSource, fsSource) {
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // console.log('Vertex shader: ', gl.getShaderInfoLog(vertexShader) || 'OK');
  // console.log('Fragment shader: ', gl.getShaderInfoLog(fragmentShader) || 'OK');

  // Create the shader program
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);


  // If creating a program failed, alert
  if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize shader program: ' + gl.getProgramInfoLog(shaderProgram));
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  var shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error has ocurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// MATRICES
var mat3 = {
  identity: function() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];

    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },

  projection: function(width, height) {
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1,
    ]
  },

  translation: function(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },

  rotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c, -s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  scaling: function(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0 , 1,
    ];
  },
};

// MISC UTILS
var vec2 = {
  copy: function(vec: Vector2) {
    return {
      x: vec.x,
      y: vec.y,
    }
  }
}

function capToBoundaries(val, min, max) {
	return Math.min(max, Math.max(val, min));
}

function arrayUnique(array: any[]): any[] {
  var result = []

  array.forEach(function(elem) {
    if(result.indexOf(elem) === -1) {
      result.push(elem);
    }
  })

  return result;
}
