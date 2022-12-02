type Shaders = {
  vertex: string,
  fragment: string,
}

// SHADER MANAGEMENT
function initShaderProgram(gl, shaders: Shaders) {
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, shaders.vertex);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, shaders.fragment);

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

// UTILS
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

// COLOR SHADER
function colorShaderDrawRectangle(gl, colorShader, color: Color, width, height, x, y, debugMe =false)
{
    let glLocations = colorShader.locations;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorShader.buffers.aPosition);
    gl.vertexAttribPointer(
      glLocations.aPosition,
      2,  // size: components per iteration
      gl.FLOAT,  // data type
      false, // normalize
      0, // stride: bytes between beggining of consecutive vetex attributes in buffer
      0 // offset: where to start reading data from the buffer
    );
    gl.enableVertexAttribArray(glLocations.aPosition);
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

function colorShaderDrawBullet(gl, colorShader, Game, bullet: Bullet) {
    colorShaderDrawRectangle(
      gl,
      colorShader,
      Game.bulletColor,
      bullet.width,
      bullet.height,
      bullet.position.x,
      bullet.position.y
    )
}

// TEXTURE SHADER
//
var SPRITE_META = {
  spriteWidth: 80,
  spriteHeight: 90,
  tankPlayer: {
    x: 40,
    y: 0,
    width: 34,
    height: 34,
  },
  tankEnemy: {
    x: 0,
    y: 0,
    width: 34,
    height: 34,
  },
  tileBrick: {
    x: 0,
    y: 40,
    width: 20,
    height: 20,
  },
  tileGrass: {
    x: 20,
    y: 40,
    width: 20,
    height: 20,
  },
  tileSteel: {
    x: 40,
    y: 40,
    width: 20,
    height: 20,
  },
  tileWater: {
    x: 60,
    y: 40,
    width: 20,
    height: 20,
  },
};

function textureShaderDrawTank(gl, textureShader, textureName, tank) {
  gl.bindBuffer(gl.ARRAY_BUFFER, textureShader.buffers.aPosition);
  gl.vertexAttribPointer(
    textureShader.locations.aPosition,
    2,  // size: components per iteration
    gl.FLOAT,  // data type
    false, // normalize
    0, // stride: bytes between beggining of consecutive vetex attributes in buffer
    0 // offset: where to start reading data from the buffer
  );
  // Enable vertex attribute
  gl.enableVertexAttribArray(textureShader.locations.aPosition);

  let tankData = tankGetData(tank.tankType);
  // Rotation angle
  let theta = 0;
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
  gl.uniformMatrix3fv(textureShader.locations.uMatrix, false, matrix);

  // Add vertices to array buffer (Requires a buffer to been previously bound to gl.ARRAY_BUFFER)
  var tankVertices = squareVertices(tankData.width, tankData.height, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tankVertices), gl.STATIC_DRAW);

  // provide texture coordinates for the tank rectangle
  gl.bindBuffer(gl.ARRAY_BUFFER, textureShader.buffers.aTexCoord)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureShaderGetTextureCoords(textureName)),
    gl.STATIC_DRAW);
  gl.enableVertexAttribArray(textureShader.locations.aTexCoord);
  gl.vertexAttribPointer(textureShader.locations.aTexCoord, 2, gl.FLOAT, false, 0, 0);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}

function textureShaderDrawRectangle(
  gl,
  textureShader,
  textureName,
  width,
  height,
  x,
  y) {
  gl.bindBuffer(gl.ARRAY_BUFFER, textureShader.buffers.aPosition);
  gl.vertexAttribPointer(
    textureShader.locations.aPosition,
    2,  // size: components per iteration
    gl.FLOAT,  // data type
    false, // normalize
    0, // stride: bytes between beggining of consecutive vetex attributes in buffer
    0 // offset: where to start reading data from the buffer
  );
  // Enable vertex attribute
  gl.enableVertexAttribArray(textureShader.locations.aPosition);
  // Set matices
  var matrixProjection = mat3.projection(gl.canvas.width, gl.canvas.height);
  var matrixChangeOrigin = mat3.translation(-width / 2, -height / 2);
  var matrixTranslation = mat3.translation(x, y);
  var matrix = mat3.identity()
  matrix = mat3.multiply(matrix, matrixProjection);
  matrix = mat3.multiply(matrix, matrixTranslation);
  matrix = mat3.multiply(matrix, matrixChangeOrigin);
  gl.uniformMatrix3fv(textureShader.locations.uMatrix, false, matrix);

  // Add vertices to array buffer (Requires a buffer to been previously bound to gl.ARRAY_BUFFER)
  var vertices = squareVertices(width, height, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // provide texture coordinates for the tank rectangle
  gl.bindBuffer(gl.ARRAY_BUFFER, textureShader.buffers.aTexCoord)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureShaderGetTextureCoords(textureName)),
    gl.STATIC_DRAW);
  gl.enableVertexAttribArray(textureShader.locations.aTexCoord);
  gl.vertexAttribPointer(textureShader.locations.aTexCoord, 2, gl.FLOAT, false, 0, 0);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}


function textureShaderGetTextureCoords(name: string) {
  let coords = SPRITE_META[name];
  let minX = coords.x/SPRITE_META.spriteWidth;
  let minY = coords.y/SPRITE_META.spriteHeight;
  let maxX = (coords.x + coords.width)/SPRITE_META.spriteWidth;
  let maxY = (coords.y + coords.height)/SPRITE_META.spriteHeight;

  return [
    minX, minY,
    minX, maxY,
    maxX, maxY,
    minX, minY,
    maxX, minY,
    maxX, maxY,
  ]
}
