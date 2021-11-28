window.onload = () => {
  var sprite = new Image();
  sprite.src = './sprite.png'; 
  sprite.onload = () => {
      run(sprite);
  }
}; 

function run(sprite) {
  var canvas = <HTMLCanvasElement> document.getElementById('canvas');
  var gl = canvas.getContext('webgl');

  // 26 x 26
  var tileMap = [ 
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','b','b','b','b','b','b','b','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','b','b','b','b','b','b','b','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','b','b','b','b','x','x','x','x','b','b','x','x','x','b','b','x','x','x','x','b','b','b','b','x'],
    [ 'x','x','b','b','b','b','x','x','x','x','b','b','x','x','x','b','b','x','x','x','x','b','b','b','b','x'],
    [ 'x','x','x','x','x','x','b','b','g','g','x','x','x','x','x','x','x','g','g','w','w','w','w','w','w','w'],
    [ 'x','x','x','x','x','x','b','b','g','g','x','x','x','x','x','x','x','g','g','w','w','w','w','w','w','w'],
    [ 'x','x','x','x','x','x','b','b','g','g','x','x','x','x','x','x','x','g','g','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','b','b','g','g','s','s','s','s','s','s','s','g','g','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','b','b','g','g','s','s','s','s','s','s','s','g','g','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','b','b','g','g','x','x','x','x','x','x','x','g','g','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','b','b','g','g','x','x','x','x','x','x','x','g','g','x','x','x','x','x','x','x'],
    [ 'x','x','b','b','b','b','b','b','g','g','x','x','x','x','x','x','x','g','g','x','x','x','x','x','x','x'],
    [ 'x','x','b','b','b','b','b','b','g','g','x','x','x','x','x','x','x','g','g','x','x','x','x','x','x','x'],
    [ 'w','w','b','b','b','b','b','b','g','g','x','x','x','x','x','x','x','g','g','x','x','x','x','x','x','x'],
    [ 'w','w','b','b','b','b','b','b','g','g','x','x','x','x','x','x','x','g','g','x','x','x','x','x','x','x'],
    [ 'x','x','b','b','b','b','b','b','g','g','x','x','x','x','x','x','x','g','g','x','x','x','x','x','x','x'],
    [ 'x','x','b','b','b','b','b','b','g','g','x','x','x','x','x','x','x','g','g','x','x','x','x','x','x','x'],
    [ 'x','x','b','b','b','b','b','b','g','g','x','x','x','x','x','x','x','g','g','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
    [ 'x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x'],
  ]


  if(gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  // SHADERS
  // Color
  var shadersColor = {
    vertex: `
      attribute vec2 aPosition;
      uniform mat3 uMatrix;
      
      void main() {
        gl_Position = vec4((uMatrix * vec3(aPosition, 1)).xy, 0, 1);
      }
    `,
    fragment: `
      precision mediump float;

      uniform vec4 uColor;

      void main() {
        gl_FragColor = uColor;
      }
    `,
  };

  var shadersTexture = {
    vertex: `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      uniform mat3 uMatrix;
      varying vec2 vTexCoord;
      
      void main() {
        gl_Position = vec4((uMatrix * vec3(aPosition, 1)).xy, 0, 1);
        vTexCoord = aTexCoord;
      }
    `,
    fragment: `
      precision mediump float;

      uniform sampler2D uImage;
      varying vec2 vTexCoord;

      void main() {
        gl_FragColor = texture2D(uImage, vTexCoord);
      }
    `,
  };

  // WEBGL SETUP

  // Compile and use shader programs
  let colorShaderProgram = initShaderProgram(gl, shadersColor);

  let colorShader = {
    program: colorShaderProgram,
    buffers: {
      aPosition: gl.createBuffer(),
    },
    locations: {
      aPosition: gl.getAttribLocation(colorShaderProgram, "aPosition"),
      uColor: gl.getUniformLocation(colorShaderProgram, "uColor"),
      uMatrix: gl.getUniformLocation(colorShaderProgram, "uMatrix"),
    }
  }

  let textureShaderProgram = initShaderProgram(gl, shadersTexture);

  let textureShader = {
    program: textureShaderProgram,
    buffers: {
      aPosition: gl.createBuffer(),
      aTexCoord: gl.createBuffer(),
    },
    locations: {
      aPosition: gl.getAttribLocation(textureShaderProgram, "aPosition"),
      aTexCoord: gl.getAttribLocation(textureShaderProgram, "aTexCoord"),
      uMatrix: gl.getUniformLocation(textureShaderProgram, "uMatrix"),
      uImage: gl.getUniformLocation(textureShaderProgram, "uImage"),
    },
    textures: {
      sprite: gl.createTexture(),
    },
  }
  // Make shader texture the active texture
  gl.bindTexture(gl.TEXTURE_2D, textureShader.textures.sprite);
  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  // Upload sprite image to the GPU's texture object
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sprite)

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Add some magic stuff to make alpha in images blend with the rest.
  // TODO(Fede): Doesn't this make the colors darker somehow?
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Ids for entities
  var entityIds = {
    current: 0,
    create: function(): number {
      var prev = this.current;
      this.current++;
      return prev;
    },
  }

  // General game constants
  let tileMapOffsetX = 0;
  let tileMapOffsetY = 0;

  let tilesX = 26;
  let tilesY = 26;
  let tileWidth = 20;
  let tileHeight = 20;
  let levelWidth = tilesX * tileWidth;
  let levelHeight = tilesY * tileHeight;
  let baseParams = {
    width: 40,
    height: 40,
    x: levelWidth / 2 + tileMapOffsetX,
    y: levelHeight - 40 / 2 + tileMapOffsetY,
  };

  // modify tile map based on baseParams
  let baseTilePositions = 
    [
      [levelHeight / tileHeight - 1 , Math.floor(levelWidth / 2 / tileWidth) - 2],
      [levelHeight / tileHeight - 2 , Math.floor(levelWidth / 2 / tileWidth) - 2],
      [levelHeight / tileHeight - 3 , Math.floor(levelWidth / 2 / tileWidth) - 2],
      [levelHeight / tileHeight - 3 , Math.floor(levelWidth / 2 / tileWidth) - 1],
      [levelHeight / tileHeight - 3 , Math.floor(levelWidth / 2 / tileWidth) + 0],
      [levelHeight / tileHeight - 3 , Math.floor(levelWidth / 2 / tileWidth) + 1],
      [levelHeight / tileHeight - 2 , Math.floor(levelWidth / 2 / tileWidth) + 1],
      [levelHeight / tileHeight - 1 , Math.floor(levelWidth / 2 / tileWidth) + 1],
    ]

  baseTilePositions.forEach((t) => {
    tileMap[t[0]][t[1]] = 'b';
  })


  var levelConfig = {
    playerSpawnPosition: {
      x: 240,
      y: 440,
    },
    enemySpawnPositions: [
      { x: 20, y: 20},
      { x: 300, y: 20},
      { x: 600, y: 20},
    ],
    tileMap: tileMap,
  }

  // GAME SETUP
  var Game = {
    // Runtime
    tLastRender: performance.now(),
    running: true,

    // Level
    levelWidth: levelWidth,
    levelHeight: levelHeight,
    tileMapOffsetX: tileMapOffsetX,
    tileMapOffsetY: tileMapOffsetY,
    tileWidth: tileWidth,
    tileHeight: tileWidth,
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
    playerSpawnPosition: levelConfig.playerSpawnPosition,
    playerColor: {
      r: 0.1,
      g: 0.8,
      b: 0.5,
      alpha: 1.0,
    },
    playerTank: {
      tankType: 'playerNormal',
      position: null,
      direction: "up",
      speed: 200,
      bullet: null,
      bulletSpeed: 800,
      player: true,
      wasDestroyed: false,
      isSpawning: true,
      id: entityIds.create(),
    },

    // Enemies
    enemySpawnCountdown: 3 * time.seconds,
    enemyColor: {
      r: 0.8,
      g: 0.2,
      b: 0.1,
      alpha: 1.0,
    },
    enemiesMax: 4,
    enemies: [
    ],
    nextEnemies: [
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
      "enemyNormal",
    ],

    // Other Entities
    bulletColor: {
      r: 1,
      g: 1,
      b: 1,
      alpha: 1.0,
    },
    base: {
      width: baseParams.width,
      height: baseParams.height,
      position: {
        x: baseParams.x,
        y: baseParams.y,
      },
      wasDestroyed: false
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
    let DEBUGTimestamp = tFrame;
    if(Game.running) {
      requestAnimationFrame(main);
    }
    /*
     * UPDATE 
     */
    var dt = tFrame - Game.tLastRender;

    if(Game.enemies.length === 0 && Game.nextEnemies.length === 0) {
      if(Game.running) {
        alert("You win");
      }
      Game.running = false;
      return;
    }

    if(Game.playerTank.wasDestroyed) {
      Game.playerLives--;
      if(Game.playerLives >= 0) {
        Game.playerTank.isSpawning = true;
        Game.playerTank.wasDestroyed = false;
      } else {
        if(Game.running) {
          alert("Game Over");
        }
        Game.running = false;
        return;
      }
    } else if(Game.base.wasDestroyed) {
      if(Game.running) {
        alert("Game Over");
      }
      Game.running = false;
      return;
    } else if(Game.playerTank.isSpawning) {
      Game.playerTank.position = vec2.copy(Game.playerSpawnPosition); 
      Game.playerTank.isSpawning = false;
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

    // Spawn enemies
    if(Game.enemies.length < Game.enemiesMax) {
      Game.enemySpawnCountdown -= dt;
    }
    if(Game.enemySpawnCountdown <= 0) {
      Game.enemySpawnCountdown = 5 * time.seconds;
      if(Game.nextEnemies.length > 0) {
        let nextEnemyTank = Game.nextEnemies.pop();
        let spawnPositions = levelConfig.enemySpawnPositions;
        let newPositionIndex = Math.floor(spawnPositions.length * Math.random());
        let newPosition = spawnPositions[newPositionIndex];
        newPosition.x += tileMapOffsetX;
        newPosition.y += tileMapOffsetY;
        let tankData = tankGetData(nextEnemyTank);
        let enemyTanks = Game.enemies.map(e => e.tank);
        let otherTanks = [Game.playerTank].concat(enemyTanks);
        let boundaries = getRectangleBoundaries(newPosition, tankData.width, tankData.height);

        // Do not spawn enemy if there is a collision
        let isColliding = false
        otherTanks.forEach(function(otherTank) {
          let otherTankData = tankGetData(otherTank.tankType);
          let otherTankBoundaries = 
            getRectangleBoundaries(otherTank.position, otherTankData.width, otherTankData.height)

          if(rectangleBoundariesAreColliding(boundaries, otherTankBoundaries)) {
            isColliding = true
          }
        })

        if(!isColliding) {
          let enemy = {
            nextDirection: null,
            changeDirectionCountdown: Math.floor((Math.random() * 5) + 2) * time.seconds,
            bulletCountdown: (Math.random() * 2 + 1) * time.seconds,
            tank: {
              tankType: nextEnemyTank,
              position: newPosition,
              direction: pickRandomDirection(),
              speed: tankData.defaultSpeed,
              bullet: null,
              bulletSpeed: tankData.bulletSpeed,
              player: false,
              wasDestroyed: false,
              isSpawning: true,
              id: entityIds.create(),
            }
          }
          Game.enemies.push(enemy);
        }


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

      if(enemy.tank.isSpawning) {
        enemy.tank.isSpawning = false;
        break;
      }

      if(enemy.nextDirection) {
        enemy.tank.direction = enemy.nextDirection;
        enemy.nextDirection = null;
        break;
      }

      enemy.changeDirectionCountdown -= dt;
      if(enemy.changeDirectionCountdown <= 0) {
        enemy.nextDirection = pickRandomDirection();
        enemy.changeDirectionCountdown = (Math.floor(Math.random() * 5) + 2) * time.seconds;
        break;
      }

      var enemyMovement = tankComputeMovementInDirection(Game, enemy.tank, dt);
      enemy.tank.position = enemyMovement.newPosition;

      if(enemyMovement.collisions.length > 0) {
        var newIndex = Math.floor(Math.random() * 4);
        enemy.nextDirection = pickRandomDirection();
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
    if(Game.spaceIsPressed && !Game.spaceWasPressed && tankCanFireBullet(Game.playerTank)) {
      bulletCreate(Game.playerTank);
    };

    // Enemy Bullet Firing
    Game.enemies.forEach(function(enemy) {
      if(tankCanFireBullet(enemy.tank)) {
        enemy.bulletCountdown -= dt;
        if(enemy.bulletCountdown <= 0) {
          bulletCreate(enemy.tank);
          enemy.bulletCountdown = (Math.random() * 1) * time.seconds;
        }
      }
    })

    DEBUGTimestamp = DEBUGTime("Update", DEBUGTimestamp);

    // DRAW
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ColorShader
    // Create and bind buffer to the position attribute
    gl.useProgram(colorShaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorShader.buffers.aPosition);
    gl.vertexAttribPointer(
      colorShader.locations.aPosition,
      2,  // size: components per iteration
      gl.FLOAT,  // data type
      false, // normalize
      0, // stride: bytes between beggining of consecutive vetex attributes in buffer
      0 // offset: where to start reading data from the buffer
    );
    // Enable vertex attribute
    gl.enableVertexAttribArray(colorShader.locations.aPosition);

    // TODO(fede): optimize tile drawing:
    // * Just do a single pass through all the tiles.
    // Draw Base
    if(!Game.base.wasDestroyed) {
      colorShaderDrawRectangle(
        gl,
        colorShader,
        {r: 0.8, g: 0.7, b: 0.8, alpha: 1.0},
        Game.base.width,
        Game.base.height,
        Game.base.position.x,
        Game.base.position.y,
      );
    }

    gl.useProgram(textureShaderProgram);
    // Draw Tiles and store ground tiles to render
    // after bullets
    let grassTiles = []
    for(var row = 0; row < Game.tileRows; row++) {
      for(var col = 0; col < Game.tileCols; col++) {
        var tile = Game.tiles[row][col];
        if(tile == 'x') continue;
        if(tile !== 'g') {
          let tileName
          switch(tile) {
            case 'b':
              tileName = 'tileBrick';
              break;
            case 's':
              tileName = 'tileSteel';
              break;
            case 'w':
              tileName = 'tileWater';
              break;
          }
          textureShaderDrawRectangle(
            gl,
            textureShader,
            tileName,
            Game.tileWidth,
            Game.tileHeight,
            col * Game.tileWidth + Game.tileWidth / 2 + tileMapOffsetX,
            row * Game.tileHeight + Game.tileHeight / 2 + tileMapOffsetY,
          );
        } else {
          grassTiles.push([col, row]);
        }
      }
    }
      

    gl.useProgram(colorShaderProgram);
    // DrawBullets
    if(Game.playerTank.bullet) {
      colorShaderDrawBullet(gl, colorShader, Game, Game.playerTank.bullet);
    }

    Game.enemies.forEach(function(enemy) {
      if(enemy.tank.bullet) {
        colorShaderDrawBullet(gl, colorShader, Game, enemy.tank.bullet);
      }
    });


    DEBUGTimestamp = DEBUGTime("Color Shader Draw", DEBUGTimestamp);

    // TextureShader
    // Create and bind buffer to the position attribute
    // TODO: Why did changing the colors break everything
    gl.useProgram(textureShaderProgram);

    // Draw Player
    textureShaderDrawTank(
      gl,
      textureShader,
      'tankPlayer',
      Game.playerTank
    )

    // Draw Enemies
    Game.enemies.forEach(function(enemy) {
      textureShaderDrawTank(
        gl,
        textureShader,
        'tankEnemy',
        enemy.tank
      )
    })

    DEBUGTimestamp = DEBUGTime("Tank Draw", DEBUGTimestamp);

    // Draw GrassTiles
    grassTiles.forEach(([col, row]) => {
        textureShaderDrawRectangle(
          gl,
          textureShader,
          'tileGrass',
          Game.tileWidth,
          Game.tileHeight,
          col * Game.tileWidth + Game.tileWidth / 2 + tileMapOffsetX,
          row * Game.tileHeight + Game.tileHeight / 2 + tileMapOffsetY,
        );
    });

    DEBUGTimestamp = DEBUGTime("Tiles Draw", DEBUGTimestamp);


    // Store input state
    Game.spaceWasPressed = Game.spaceIsPressed;

    Game.tLastRender = tFrame;

    // END
    let timeSpent = performance.now() - tFrame;
    DEBUG("Frame took " + timeSpent + " milliseconds");
    DEBUG("FPS: " + (1000 / timeSpent));

  };

  // Run the main Loop
  requestAnimationFrame(main);
}

// ENTITY DATA

// TANK
function tankGetData(tankType: string): TankData {
    var data =  {
      playerNormal: {
        width: 35,
        height: 35,
        defaultSpeed: 100,
        bulletSpeed: 800,
      },
      enemyNormal: {
        width: 35,
        height: 35,
        defaultSpeed: 100,
        bulletSpeed: 800,
      },
    }[tankType];

    return data;
}

function tankIsSolid(tank: Tank): boolean {
  return !tank.isSpawning && !tank.wasDestroyed;
}

function tankCanFireBullet(tank: Tank): boolean {
  return !tank.bullet && (tank.position !== null);
}

// GAME UPDATE

function pickRandomDirection(): string {
  let newIndex = Math.floor(Math.random() * 4);
  return ['up', 'down', 'right', 'left'][newIndex];
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
    rectangleBoundariesCollisionsTileMapLimits(
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
    if(otherTank.id !== tank.id && tankIsSolid(otherTank)) {
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
  boundaries = getRectangleBoundaries(newPosition, relativeWidth, relativeHeight);
  collisions = collisions.concat(tankCollisions);

  // Base Collisions
  let baseBoundaries = getRectangleBoundaries(Game.base.position, Game.base.width, Game.base.height)
  if(rectangleBoundariesAreColliding(boundaries, baseBoundaries)) {
    newPosition = vec2.copy(tank.position);
    boundaries = getRectangleBoundaries(newPosition, relativeHeight, relativeWidth);
    collisions = collisions.concat({entity: 'base', metadata: {boundaries: baseBoundaries}});
  }


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

  // Screen Limits
  var screenLimitsCollisions = 
    rectangleBoundariesCollisionsTileMapLimits(
      Game, boundaries, newPosition, relativeWidth, relativeHeight);
  boundaries = screenLimitsCollisions.boundaries;
  newPosition = screenLimitsCollisions.position;
  collisions = collisions.concat(screenLimitsCollisions.collisions);

  // Tiles
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

  // Tanks
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

  // Base
  if(rectangleBoundariesAreColliding(
    boundaries,
    getRectangleBoundaries(Game.base.position, Game.base.width, Game.base.height))
  ) {
    Game.base.wasDestroyed = true;
    collisions.push({entity: "base"});
  }

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

function rectangleBoundariesCollisionsTileMapLimits(Game, boundaries: RectangleBoundaries, position: Vector2, width, height) {
  var minX = Math.round(width / 2) + Game.tileMapOffsetX;
  var maxX = Math.round(Game.levelWidth - width / 2) + Game.tileMapOffsetX;
  var minY = Math.round(height / 2) + Game.tileMapOffsetY;
  var maxY = Math.round(Game.levelHeight - height / 2) + Game.tileMapOffsetY;
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

function positionAbsoluteToRelative(Game, position: Vector2): Vector2 {
  return {
    x: position.x - Game.tileMapOffsetX,
    y: position.y - Game.tileMapOffsetY,
  }
}

function positionRelativeToAbsolute(Game, position: Vector2): Vector2 {
  return {
    x: position.x + Game.tileMapOffsetX,
    y: position.y + Game.tileMapOffsetY,
  }
}

function rectangleBoundariesCollisionsTiles(Game, boundaries: RectangleBoundaries, position: Vector2, movement: Vector2, width, height, targetTiles: string[]) {
  var collisions = [];
  var newPosition = {x: position.x, y: position.y};
  var newPositionRelative = positionAbsoluteToRelative(Game, newPosition);

  var isTargetTile = function(tile) { return targetTiles.indexOf(tile) !== -1 }

  // Do relative boundaries relative to Tile Map
  var boundariesRelative = {
    top: boundaries.top - Game.tileMapOffsetY,
    bottom: boundaries.bottom - Game.tileMapOffsetY,
    right: boundaries.right - Game.tileMapOffsetX,
    left: boundaries.left - Game.tileMapOffsetX,
  };

  // check collision to the right
  if(movement.x > 0) {
    var col = Math.min(Math.floor((boundariesRelative.right) / Game.tileWidth), Game.tileCols - 1);
    var topRow = Math.floor((boundariesRelative.top + 1) / Game.tileHeight);
    var centerRow = Math.floor(newPositionRelative.y / Game.tileHeight);
    var bottomRow = Math.floor((boundariesRelative.bottom - 1) / Game.tileHeight);

    var collided = false;
    arrayUnique([topRow, centerRow, bottomRow]).forEach(function(row) {
      var tile = Game.tiles[row][col];
      if(isTargetTile(tile)) {
        collided = true;
        collisions.push({entity: 'tile', metadata: {tile: tile, col: col, row: row}})
      }
    });

    if(collided) {
      newPositionRelative.x = Math.round((col) * Game.tileWidth - width / 2);
    }
  }

  // check collision to the left
  if(movement.x < 0) {
    var col = Math.floor(boundariesRelative.left / Game.tileWidth);
    var topRow = Math.floor((boundariesRelative.top) / Game.tileHeight);
    var centerRow = Math.floor(newPositionRelative.y / Game.tileHeight);
    var bottomRow = Math.floor((boundariesRelative.bottom) / Game.tileHeight);

    var collided = false;
    arrayUnique([topRow, centerRow, bottomRow]).forEach(function(row) {
      var tile = Game.tiles[row][col];
      if(isTargetTile(tile)) {
        collided = true;
        collisions.push({entity: 'tile', metadata: {tile: tile, col: col, row: row}})
      }
    });

    if(collided) {
      newPositionRelative.x = Math.round((col + 1) * Game.tileWidth + width / 2);
    }
  }

  // check collision going down 
  if(movement.y > 0) {
    var row = Math.min(Math.floor(boundariesRelative.bottom / Game.tileHeight), Game.tileRows - 1);
    var leftCol = Math.floor((boundariesRelative.left + 1) / Game.tileWidth);
    var centerCol = Math.floor(newPositionRelative.x / Game.tileWidth);
    var rightCol = Math.floor((boundariesRelative.right - 1) / Game.tileWidth);

    var collided = false;
    arrayUnique([leftCol, centerCol, rightCol]).forEach(function(col) {
      var tile = Game.tiles[row][col];
      if(isTargetTile(tile)) {
        collided = true;
        collisions.push({entity: 'tile', metadata: {tile: tile, col: col, row: row}})
      }
    });

    if(collided) {
      newPositionRelative.y = Math.round((row) * Game.tileHeight - height / 2);
    }
  }

  // check collision going up 
  if(movement.y < 0) {
    var row = Math.floor(boundariesRelative.top / Game.tileHeight);
    var leftCol = Math.floor((boundariesRelative.left + 1) / Game.tileWidth);
    var centerCol = Math.floor(newPositionRelative.x / Game.tileWidth);
    var rightCol = Math.floor((boundariesRelative.right - 1) / Game.tileWidth);

    var collided = false;
    arrayUnique([leftCol, centerCol, rightCol]).forEach(function(col) {
      var tile = Game.tiles[row][col];
      if(isTargetTile(tile)) {
        collided = true;
        collisions.push({entity: 'tile', metadata: {tile: tile, col: col, row: row}})
      }
    });

    if(collided){
      newPositionRelative.y = Math.round((row + 1) * Game.tileHeight + height / 2);
    }
  }

  newPosition = positionRelativeToAbsolute(Game, newPositionRelative);
  var newBoundaries = getRectangleBoundaries(newPosition, width, height);

  var result =  {
    boundaries: newBoundaries,
    position: newPosition,
    collisions: collisions,
  }

  return result;
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
var time = {
  seconds: 1000,
}

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

function DEBUG(log: string) {
  if (Config.debug) {
    console.log(log);
  }
}

function DEBUGTime(log: string, start: number): number {
  let end = performance.now();
  if (Config.debug) {
    let duration = end - start;
    console.log(`${log}: ${duration}ms`)
  }

  return end;
}
