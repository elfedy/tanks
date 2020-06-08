window.onload = run; 

function run() {
  var canvas = <HTMLCanvasElement> document.getElementById('canvas');
  var gl = canvas.getContext('webgl');

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

    // Player
    playerWidth: 30,
    playerHeight: 30,
    playerSpeed: 200,
    playerDirection: null,
    playerPosition: {
      x: 10,
      y: 10
    },
  }

  // EVENT LISTENERS
  document.addEventListener('keydown', function(e) {
    switch(e.key) {
      case 'ArrowUp': {
        Game.arrowUpIsPressed = true;
        Game.playerDirection = "up";
      } break;
      case 'ArrowDown': {
        Game.arrowDownIsPressed = true;
        Game.playerDirection = "down";
      } break;
      case 'ArrowRight': {
        Game.arrowRightIsPressed = true;
        Game.playerDirection = "right";
      } break;
      case 'ArrowLeft': {
        Game.arrowLeftIsPressed = true;
        Game.playerDirection = "left";
      } break;
    }
  })

  document.addEventListener('keyup', function(e) {
    switch(e.key) {
      case 'ArrowUp': {
        Game.arrowUpIsPressed = false;
        pickPlayerDirection(Game)
      } break;
      case 'ArrowDown': {
        Game.arrowDownIsPressed = false;
        pickPlayerDirection(Game)
      } break;
      case 'ArrowRight': {
        Game.arrowRightIsPressed = false;
        pickPlayerDirection(Game)
      } break;
      case 'ArrowLeft': {
        Game.arrowLeftIsPressed = false;
        pickPlayerDirection(Game)
      } break;
    }
  })


  // Define and set color for rectangle
  var color = [0.1, 0.8, 0.5, 1];
  gl.uniform4fv(glLocations.uColor, color);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;

  // TODO... See what's missing...
  //set the matrix

  // Compute the matrices
  /*
   *
  var translation = [300, 300]
  var theta = Math.PI * 0.5;
  var scale = [0.5, 0.5];
  var moveOriginMatrix = mat3.translation(-50, -75);
  var translationMatrix = mat3.translation(translation[0], translation[1]);
  var rotationMatrix = mat3.rotation(theta);
  var scaleMatrix = mat3.scaling(scale[0], scale[1]);

  // Multiply the matrices
  var matrix = mat3.multiply(translationMatrix, rotationMatrix);
  matrix = mat3.multiply(matrix, scaleMatrix);
  matrix = mat3.multiply(matrix, moveOriginMatrix);
   */




  // Define main loop
  function main(tFrame) {
    /*
     * DRAW
     */
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Update 
    var dt = tFrame - Game.tLastRender;
    var dx = 0;
    var dy = 0;
    if(Game.playerDirection == "right") {
      dx += Game.playerSpeed * dt / 1000;
    } else if(Game.playerDirection == "left") {
      dx -= Game.playerSpeed * dt / 1000;
    } else if(Game.playerDirection == "up") {
      dy -= Game.playerSpeed * dt / 1000;
    } else if(Game.playerDirection == "down") {
      dy += Game.playerSpeed * dt / 1000;
    }

    Game.playerPosition.x =
      capToBoundaries(Game.playerPosition.x += dx, Game.playerWidth / 2, Game.levelWidth - Game.playerWidth / 2)
    Game.playerPosition.y =
      capToBoundaries(Game.playerPosition.y += dy, Game.playerHeight / 2, Game.levelHeight - Game.playerHeight / 2)


    // Draw Player
    var matrixProjection = mat3.projection(gl.canvas.width, gl.canvas.height);
    var matrixChangeOrigin = mat3.translation(-Game.playerWidth / 2, -Game.playerHeight / 2);
    var matrixTranslation = mat3.translation(Game.playerPosition.x, Game.playerPosition.y);
    var matrix = mat3.identity()
    matrix = mat3.multiply(matrix, matrixProjection);
    matrix = mat3.multiply(matrix, matrixTranslation);
    matrix = mat3.multiply(matrix, matrixChangeOrigin);
    gl.uniformMatrix3fv(glLocations.uMatrix, false, matrix);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertices(Game.playerWidth, Game.playerHeight)), gl.STATIC_DRAW);
    gl.drawArrays(primitiveType, offset, count);

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
    Game.playerDirection = null;
  }
}

// DRAW UTILS

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
