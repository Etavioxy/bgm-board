// 初始化WebGL上下文
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

const available_extensions = gl.getSupportedExtensions();
console.log(available_extensions);

if(!(available_extensions.includes("OES_texture_float"))){
  console.error('OES_texture_float not support!');
}

var ext = gl.getExtension("OES_texture_float");
var linear =  gl.getExtension("OES_texture_float_linear");


// 编译并链接着色器程序
let vertexShader_text = await(await fetch('vert.glsl')).text();
let fragmentShader_text = await(await fetch('frag.glsl')).text();

let program = createShaderProgram(gl, vertexShader_text, fragmentShader_text);

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
    float d = texture2D(uTexture, texCoord).r;
    
    // coloring
    vec3 col = (d>0.0) ? vec3(0.4,0.7,0.4) : vec3(0.65,0.85,1.0);
    col *= 1.0 - exp(-6.0*abs(d));
    col *= 0.8 + 0.2*cos(150.0*d);
    col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.01,abs(d)) );

    gl_FragColor = vec4(col,1.0);
}`;

let displayProgram = createShaderProgram(gl, displayVertexShaderSource, displayFragmentShaderSource);

let [ framebuffer, texture ] = createFramebuffer(gl, program, canvas.width, canvas.height);

gl.useProgram(displayProgram);

const uTextureLocation = gl.getUniformLocation(displayProgram, 'uTexture');
gl.uniform1i(uTextureLocation, 0);

gl.useProgram(program);

// 设置顶点属性
const aPosition = gl.getAttribLocation(program, 'aPosition');
gl.enableVertexAttribArray(aPosition);

const vertices = new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]);
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

// 设置 uniform 参数
const uResolution = gl.getUniformLocation(program, 'uResolution');
gl.uniform2f(uResolution, canvas.width, canvas.height);

const circleData = [
  1.0,  0.0, 0.5,
  0.0,  0.0, 0.7,
  -1.0, 0.0, 0.35,
];

const numCircles = gl.getUniformLocation(program, 'numCircles');
const uCircles = gl.getUniformLocation(program, 'uCircles');
gl.uniform1i(numCircles, 3);
gl.uniform3fv(uCircles, circleData);

let times = 0;

function updateData(){
  circleData[0] += -0.001;
  if( (++times)%1000 == 0 ) console.log(times);
  gl.uniform1i(numCircles, 3);
  gl.uniform3fv(uCircles, circleData);
}

// 渲染循环
function render() {
  // 绘制到帧缓冲
  gl.useProgram(program);
  updateData();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(render);
  
  // 解绑帧缓冲区
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.useProgram(displayProgram);

  // 绑定纹理并绘制
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
requestAnimationFrame(render);

(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//cdn.jsdelivr.net/gh/Kevnz/stats.js/build/stats.min.js';document.head.appendChild(script);})()

function createShaderProgram(gl, vertexShader_text, fragmentShader_text){
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShader_text);
  gl.compileShader(vertexShader);
  
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShader_text);
  gl.compileShader(fragmentShader);
  console.log(gl.getShaderInfoLog(fragmentShader));
  
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  return program;
}

function createFramebuffer(gl, program, width, height){
  gl.useProgram(program);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  
  // 创建一个纹理对象并设置其尺寸
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);


  //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); // 假设尺寸为 512x512
  //z.js:110  WebGL: INVALID_ENUM: texImage2D: invalid format
  //gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, width, height, 0, gl.RED, gl.HALF_FLOAT, null); // 单通道浮点数纹理设置
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.FLOAT, null); // 单通道浮点数纹理设置
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  // 将纹理附加到帧缓冲对象上
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  
  // 检查帧缓冲是否附加成功
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    console.error('Failed to attach texture to framebuffer');
  }
  return [ framebuffer, texture ] ;
}