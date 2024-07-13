const canvas = document.getElementById('glCanvas2');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
}

// 创建顶点着色器
const vertexShaderSource = `
attribute vec2 position;
varying vec2 pos;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    pos = position;
}`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

// 创建片元着色器
const fragmentShaderSource = `
precision mediump float;
varying vec2 pos;

void main() {
    gl_FragColor = vec4(pos , 0.0, 1.0);
}`;

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
console.log(gl.getShaderInfoLog(fragmentShader));

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

// 创建帧缓冲区并绑定纹理
const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); // 假设尺寸为 512x512

gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

// 渲染到纹理
gl.viewport(0, 0, 512, 512); // 设置视口大小为纹理大小
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

// 解绑帧缓冲区
gl.bindFramebuffer(gl.FRAMEBUFFER, null);

// 清除画布
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// 绘制纹理到 Canvas
const displayProgram = gl.createProgram();
const displayVertexShaderSource = `
attribute vec2 position;
varying vec2 texCoord;

void main() {
    texCoord = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

const displayFragmentShaderSource = `
precision mediump float;
varying vec2 texCoord;
uniform sampler2D uTexture;

void main() {
    //gl_FragColor = vec4(texCoord,0,0);
    //return ;
    gl_FragColor = texture2D(uTexture, texCoord);
}`;

const displayVertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(displayVertexShader, displayVertexShaderSource);
gl.compileShader(displayVertexShader);

const displayFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(displayFragmentShader, displayFragmentShaderSource);
gl.compileShader(displayFragmentShader);
console.log(gl.getShaderInfoLog(displayFragmentShader));

gl.attachShader(displayProgram, displayVertexShader);
gl.attachShader(displayProgram, displayFragmentShader);
gl.linkProgram(displayProgram);
gl.useProgram(displayProgram);

const displayPositionLocation = gl.getAttribLocation(displayProgram, 'position');
gl.enableVertexAttribArray(displayPositionLocation);
gl.vertexAttribPointer(displayPositionLocation, 2, gl.FLOAT, false, 0, 0);

const uTextureLocation = gl.getUniformLocation(displayProgram, 'uTexture');
gl.uniform1i(uTextureLocation, 0);

// 绑定纹理并绘制
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);


gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);