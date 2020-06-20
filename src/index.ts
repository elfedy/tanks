type EntityPosition = {
  x: number,
  y: number,
}

window.onload = run; 

function run() {
  var canvas = <HTMLCanvasElement> document.getElementById('canvas');
  var gl = canvas.getContext('webgl');


  // tile map: 640 x 480 means 24 rows of 32 tiles

  var tileMap = [ 
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','b','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'b','b','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'b','b','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x']
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
    playerWidth: 40,
    playerHeight: 40,
    playerSpeed: 300,
    playerDirection: "up",
    playerPosition: {
      x: 10,
      y: 10
    },
    playerColor: {
      r: 0.1,
      g: 0.8,
      b: 0.5,
      alpha: 1.0,
    },
    playerBulletSpeed: 800,
    playerBullet: null,

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
    var dx = 0;
    var dy = 0;

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
          Game.playerDirection = Game.lastDirectionPressed;
        } else {
          // Pick one of the pressed directions
          Game.playerDirection = pressedDirections.pop();
        }
      } else {
        Game.playerDirection = Game.lastDirectionPressed;
      }
    }

    if(isMoving) {
      if(Game.playerDirection === "right") {
        dx += Game.playerSpeed * dt / 1000;
      } else if(Game.playerDirection === "left") {
        dx -= Game.playerSpeed * dt / 1000;
      } else if(Game.playerDirection === "up") {
        dy -= Game.playerSpeed * dt / 1000;
      } else if(Game.playerDirection === "down") {
        dy += Game.playerSpeed * dt / 1000;
      }
    }

    let newPlayerPosition = 
      {
        x: Game.playerPosition.x += dx,
        y: Game.playerPosition.y += dy,
      }

    // collision with screen limits
    newPlayerPosition.x = 
      capToBoundaries(newPlayerPosition.x, Game.playerWidth / 2, Game.levelWidth - Game.playerWidth / 2)
    newPlayerPosition.y =
      capToBoundaries(newPlayerPosition.y, Game.playerHeight / 2, Game.levelHeight - Game.playerHeight / 2)
    
    // player collision with tiles
    var playerBoundaries = getRectangleBoundaries(newPlayerPosition, Game.playerWidth, Game.playerHeight);

    for(var i = 0; i < Game.tiles.length; i++) {
      var tile = Game.tiles[i];
      var tileBoundaries = getRectangleBoundaries(tile.position, tile.width, tile.height);

      var colission = rectangleBoundariesAreColliding(playerBoundaries, tileBoundaries);
      if(colission) {
        if(Game.playerDirection == "up" || Game.playerDirection == "down") {
          if(Game.playerPosition.y > tileBoundaries.bottom) {
            newPlayerPosition.y = tileBoundaries.bottom + Game.playerHeight / 2;
          } else {
            newPlayerPosition.y = tileBoundaries.top - Game.playerWidth / 2;
          }
        }

        if(Game.playerDirection == "left" || Game.playerDirection == "right") {
          if(Game.playerPosition.x < tileBoundaries.left) {
            newPlayerPosition.x = tileBoundaries.left - Game.playerWidth / 2;
          } else {
            newPlayerPosition.x = tileBoundaries.right + Game.playerWidth / 2;
          }
        }
      } 
    }

    Game.playerPosition = newPlayerPosition;

    // Update player bullet position
    if(Game.playerBullet) {
      var bullet = Game.playerBullet;
      bullet.position.x += (bullet.vx * dt / 1000);
      bullet.position.y += (bullet.vy * dt / 1000);

      var bulletBoundaries = getRectangleBoundaries(bullet.position, bullet.width, bullet.height);

      // bullet collision with tiles
      var collision = false;
      for(var j = 0; j < Game.tiles.length; j++) {
        var tile = Game.tiles[j];
        var tileBoundaries = getRectangleBoundaries(tile.position, tile.width, tile.height);
        var collidedWithTile = rectangleBoundariesAreColliding(bulletBoundaries, tileBoundaries);
        if(collidedWithTile) {
          collision = true;
          if(tile.tileType == "brick") {
            Game.tiles.splice(j, 1);
          }
        }
      }

      // bullet collsion with boundaries
      if(bullet.position.x < 0 || bullet.position.x > Game.levelWidth || bullet.position.y < 0 || bullet.position.y > Game.levelHeight) {
        collision = true;
      }

      if(collision) {
        // Remove Bullet
        Game.playerBullet = null;
        i--;
      }
    }

    // Bullet Firing
    if(Game.spaceIsPressed && !Game.spaceWasPressed && !Game.playerBullet) {
      var bulletSpeed = Game.playerBulletSpeed;
      var vx = 0;
      var vy = 0;

      switch(Game.playerDirection) {
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

      Game.playerBullet = {
        vx: vx,
        vy: vy,
        width: 10,
        height: 10,
        position: {
          x: Game.playerPosition.x,
          y: Game.playerPosition.y,
        },
      };
    };


    // Draw Player
    drawRectangle(
      gl,
      glLocations,
      Game.playerColor,
      Game.playerWidth,
      Game.playerHeight,
      Game.playerPosition.x, 
      Game.playerPosition.y
    )

    // Draw Tile
    var tileColors = {
      brick: {
        r: 0.67,
        g: 0.38,
        b: 0.3,
        alpha: 1.0,
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
    if(Game.playerBullet) {
        drawRectangle(
          gl,
          glLocations,
          Game.bulletColor,
          Game.playerBullet.width,
          Game.playerBullet.height,
          Game.playerBullet.position.x,
          Game.playerBullet.position.y
        )
    }

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

type RectangleBoundaries = {
  top: number,
  bottom: number,
  right: number,
  left: number,
};

function rectangleBoundariesAreColliding(a: RectangleBoundaries, b: RectangleBoundaries)
: boolean
{
  var below = a.top >= b.bottom;
  var above = a.bottom <= b.top;
  var left = a.right <= b.left;
  var right = a.left >= b.right;

  return !(below || above || left || right);
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
        var tileTypes = {
            b: 'brick',
            g: 'grass',
            s: 'steel',
          };

        tiles.push({
          position: {
            x: 10 + 20 * j, 
            y: 10 + 20 * i,
          },
          tileType: tileTypes[tileMap[i][j]],
          width: 20,
          height: 20
        });
      }
    }
  }
  return tiles;
}

function squareVertices(width: number, height: number): number[] {
  return [
    0, 0,
    0, height,
    width, height,
    0, 0,
    width, 0,
    width, height,
  ]
}

function drawRectangle(gl, glLocations, color, width, height, x, y)
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertices(width, height)), gl.STATIC_DRAW);

    // Define and set color for rectangle
    var colorArray = [color.r, color.g, color.b, color.alpha]
    gl.uniform4fv(glLocations.uColor, colorArray);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
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
