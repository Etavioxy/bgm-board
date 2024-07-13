const canvas = document.getElementById('glCanvas3');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
}

// 创建顶点着色器
const vertexShaderSource = `
attribute vec2 position;
varying vec2 texCoord;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    texCoord = vec2(position.x, -position.y) * 0.5 + 0.5;
}`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

// 创建片元着色器
const fragmentShaderSource = `
precision mediump float;
varying vec2 texCoord;

uniform sampler2D uTexture;

void main() {
    //gl_FragColor = vec4(texCoord, 0.0, 1.0); return;
    gl_FragColor = texture2D(uTexture, texCoord);
}`;

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

// 创建着色器程序
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// 创建顶点缓冲区
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

// 获取attribute位置
const positionLocation = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// 创建纹理并加载图像
const texture = gl.createTexture();
const image = new Image();
image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  

    const uTextureLocation = gl.getUniformLocation(program, 'uTexture');
    gl.uniform1i(uTextureLocation, 0);
    
    // 绑定纹理并绘制
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};
image.src = 'example.jpg';
