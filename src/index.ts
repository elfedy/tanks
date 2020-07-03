// TYPES
type Color = {
  r: number,
  g: number,
  b: number,
  alpha: number,
}

type EntityPosition = {
  x: number,
  y: number,
}

type Tank = {
  tankType: string,
  position: EntityPosition,
  direction: string,
  speed: number,
  bullet: Bullet,
  bulletSpeed: number,
}

type Bullet = {
  vx: number,
  vy: number,
  width: number,
  height: number,
  position: EntityPosition, 
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
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','w','w','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','w','w','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
    [ 'b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','w','w','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','w','w','x'],
    [ 'b','b','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','s','s','x'],
    [ 'b','b','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','s','s','x']
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


  // GAME SETUP
  var Game = {
    // Runtime
    tLastRender: performance.now(),
    running: true,

    // Level
    levelWidth: gl.canvas.width,
    levelHeight: gl.canvas.height,

    // Input
    arrowDownIsPressed: false,
    arrowUpIsPressed:false,
    arrowRightIsPressed: false,
    arrowLeftIsPressed:false,
    lastDirectionPressed: null,

    spaceIsPressed: false,
    spaceWasPressed: false,

    // Player
    playerColor: {
      r: 0.1,
      g: 0.8,
      b: 0.5,
      alpha: 1.0,
    },
    playerTank: {
      tankType: 'playerNormal',
      position: { x: 40, y: 40 },
      direction: "up",
      speed: 300,
      bullet: null,
      bulletSpeed: 800,
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
    tiles: parseTileMap(tileMap), 
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
    /*
     * DRAW
     */
    // Clear the canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Update 
    var dt = tFrame - Game.tLastRender;
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

    var newPlayerPosition = Game.playerTank.position;
    if(isMoving) {
      newPlayerPosition = tankEstimateNewPositionForMovement(Game.playerTank, dt);
    }

    // collision with screen limits
    var playerTankData = tankGetData(Game.playerTank.tankType);
    newPlayerPosition.x = 
      capToBoundaries(newPlayerPosition.x, playerTankData.width / 2, Game.levelWidth - playerTankData.width / 2)
    newPlayerPosition.y =
      capToBoundaries(newPlayerPosition.y, playerTankData.height / 2, Game.levelHeight - playerTankData.height / 2)
    
    // player collision with tiles
    var playerBoundaries = getRectangleBoundaries(newPlayerPosition, playerTankData.width, playerTankData.height);

    for(var i = 0; i < Game.tiles.length; i++) {
      var tile = Game.tiles[i];

      if(tile.tileType === 'g') {
        continue;
      }

      var tileBoundaries = getRectangleBoundaries(tile.position, tile.width, tile.height);
      var collission = rectangleBoundariesAreColliding(playerBoundaries, tileBoundaries);
      if(collission) {
        newPlayerPosition = tankPositionForBoundaryCollision(Game.playerTank, newPlayerPosition, tileBoundaries)
      }
    }

    Game.playerTank.position = newPlayerPosition;

    // Update enemies position
    Game.enemies.forEach(function(enemy) {
      if(enemy.nextDirection) {
        enemy.tank.direction = enemy.nextDirection;
        enemy.nextDirection = null;
      }
      var newEstimatePosition = tankEstimateNewPositionForMovement(enemy.tank, dt);
      var tankData = tankGetData(enemy.tank.tankType);
      var shouldPickNewDirection = false;
      // collision with screen limits
      var newPosition = {x: newEstimatePosition.x, y: newEstimatePosition.y};
      newPosition.x = 
        capToBoundaries(newPosition.x, tankData.width / 2, Game.levelWidth - tankData.width / 2)
      newPosition.y =
        capToBoundaries(newPosition.y, tankData.height / 2, Game.levelHeight - tankData.height / 2)

      if((newPosition.x !== newEstimatePosition.x) || (newPosition.y !== newEstimatePosition.y)) {
        var newIndex = Math.floor(Math.random() * 4);
        shouldPickNewDirection = true;
      }

      // enemy collision with tiles
      var enemyBoundaries = getRectangleBoundaries(newPosition, tankData.width, tankData.height);

      for(var i = 0; i < Game.tiles.length; i++) {
        var tile = Game.tiles[i];

        if(tile.tileType === 'g') {
          continue;
        }

        var tileBoundaries = getRectangleBoundaries(tile.position, tile.width, tile.height);
        var collision = rectangleBoundariesAreColliding(enemyBoundaries, tileBoundaries);
        if(collision) {
          var isCollidingInDirection
          switch(enemy.tank.direction) {
            case "up":
              isCollidingInDirection = enemyBoundaries.top <= enemyBoundaries.bottom;
              break;
            case "down":
              isCollidingInDirection = enemyBoundaries.bottom >= enemyBoundaries.top;
              break;
            case "right":
              isCollidingInDirection = enemyBoundaries.right >= enemyBoundaries.left;
              break;
            case "left":
              isCollidingInDirection = enemyBoundaries.left <= enemyBoundaries.left;
              break;
          }
          if(isCollidingInDirection) {
            //newPosition = tankPositionForBoundaryCollision(enemy.tank, newPosition, tileBoundaries)
            newPosition = enemy.tank.position;
            
            // pick a new direction at random
            shouldPickNewDirection = true;
            break;
          }
        }
      }
      enemy.tank.position = newPosition;

      if(shouldPickNewDirection) {
        var newIndex = Math.floor(Math.random() * 4);
        enemy.nextDirection = ['up', 'down', 'right', 'left'][newIndex];
      }
    })

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

    Game.tiles.forEach(function(tile) {
      drawRectangle(
        gl,
        glLocations,
        tileColors[tile.tileType],
        tile.width,
        tile.height,
        tile.position.x,
        tile.position.y
      );
    })

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
function tankGetData(tankType) {
    console.log(tankType);
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
function tankEstimateNewPositionForMovement(tank: Tank, dt: number) : EntityPosition {
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
    x: tank.position.x + dx,
    y: tank.position.y + dy,
  };
}

function tankPositionForBoundaryCollision(
    tank: Tank,
    estimatedPosition: EntityPosition,
    tileBoundaries: RectangleBoundaries): EntityPosition {

  var newPlayerPosition = JSON.parse(JSON.stringify(estimatedPosition));
  var tankData = tankGetData(tank.tankType);
  var tankBoundaries = getRectangleBoundaries(tank.position, tankData.width, tankData.height);

  switch(tank.direction) {
    case "up":
      if(tileBoundaries.bottom >= tankBoundaries.top) {
        newPlayerPosition.y = Math.round(tileBoundaries.bottom + tankData.height / 2);
      }
      break;
    case "down":
      if(tileBoundaries.top <= tankBoundaries.bottom) {
        newPlayerPosition.y = Math.round(tileBoundaries.top - tankData.height / 2);
      }
      break;
    case "left":
      if(tileBoundaries.right >= tankBoundaries.left) {
        newPlayerPosition.x = Math.round(tileBoundaries.right + tankData.width / 2);
      }
      break;
    case "right":
      if(tileBoundaries.left <= tankBoundaries.right) {
        newPlayerPosition.x = Math.round(tileBoundaries.left - tankData.width / 2);
      }
      break;
  }

  /*
  if(tank.direction === "up" || tank.direction === "down") {
    if(tank.position.y > tileBoundaries.bottom) {
      newPlayerPosition.y = Math.round(tileBoundaries.bottom + tankData.height / 2);
    } else {
      newPlayerPosition.y = Math.round(tileBoundaries.top - tankData.height / 2);
    }
  }

  if(tank.direction === "left" || tank.direction === "right") {
    if(tank.position.x < tileBoundaries.left) {
      newPlayerPosition.x = Math.round(tileBoundaries.left - tankData.width / 2);
    } else {
      newPlayerPosition.x = Math.round(tileBoundaries.right + tankData.width / 2);
    }
  }
   */

  return newPlayerPosition;
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
    };
}

function bulletUpdate(tank: Tank, Game, dt) {
    var bullet = tank.bullet;
    if(!bullet) { 
      return;
    }
    bullet.position.x += Math.round(bullet.vx * dt / 1000);
    bullet.position.y += Math.round(bullet.vy * dt / 1000);

    var bulletBoundaries = getRectangleBoundaries(bullet.position, bullet.width, bullet.height);

    // bullet collision with tiles
    var collision = false;
    for(var j = 0; j < Game.tiles.length; j++) {
      var tile = Game.tiles[j];
      if(tile.tileType === 'g' || tile.tileType === 'w') {
        continue;
      }
      var tileBoundaries = getRectangleBoundaries(tile.position, tile.width, tile.height);
      var collidedWithTile = rectangleBoundariesAreColliding(bulletBoundaries, tileBoundaries);
      if(collidedWithTile) {
        collision = true;
        if(tile.tileType == "b") {
          Game.tiles.splice(j, 1);
          j--;
        }
      }
    }

    // bullet collsion with boundaries
    if(bullet.position.x < 0 || bullet.position.x > Game.levelWidth || bullet.position.y < 0 || bullet.position.y > Game.levelHeight) {
      collision = true;
    }

    if(collision) {
      // Remove Bullet
      tank.bullet = null;
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

function getRectangleBoundaries(position: EntityPosition, width: number, height: number) : RectangleBoundaries {
  return {
    top: position.y - height / 2,
    bottom: position.y + height / 2,
    right: position.x + width / 2,
    left: position.x - width / 2,
    
  };
};
// DRAW UTILS
// NOTE(Fede): Tile map is an array of 24 arrays (rows) of 32 tiles
// Returns the corresponding tile entities
function parseTileMap(tileMap) {
  let tiles = [];
  for(var i = 0; i < 24; i++) {
    for(var j = 0; j < 32; j++) {
      if(tileMap[i][j] !== 'x') {

        tiles.push({
          position: {
            x: 10 + 20 * j, 
            y: 10 + 20 * i,
          },
          tileType: tileMap[i][j],
          width: 20,
          height: 20
        });
      }
    }
  }
  return tiles;
}

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
    console.log(tank);
    console.log(tank.position);
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
function capToBoundaries(val, min, max) {
	return Math.min(max, Math.max(val, min));
}
