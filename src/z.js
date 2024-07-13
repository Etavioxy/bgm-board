// 初始化WebGL上下文
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

const available_extensions = gl.getSupportedExtensions();

if(!(available_extensions.includes("OES_texture_float"))){
  console.error('OES_texture_float not support!');
}

var ext = gl.getExtension("OES_texture_float");
var linear =  gl.getExtension("OES_texture_float_linear");


// 编译并链接着色器程序
const vertexShader_text = await(await fetch('vert.glsl')).text();
const fragmentShader_text = await(await fetch('frag.glsl')).text();

let program = createShaderProgram(gl, vertexShader_text, fragmentShader_text);

const fragmentShader2_text = await(await fetch('frag2.glsl')).text();

let displayProgram = createShaderProgram(gl, vertexShader_text, fragmentShader2_text);

let [ framebuffer, texture ] = createFramebuffer(gl, program, canvas.width, canvas.height);

// init display
{
  gl.useProgram(displayProgram);
  
  const uResolution = gl.getUniformLocation(displayProgram, 'uResolution');
  gl.uniform2f(uResolution, canvas.width, canvas.height);
  
  const uTextureLocation = gl.getUniformLocation(displayProgram, 'uTexture');
  gl.uniform1i(uTextureLocation, 0);
}

// init program
{
  gl.useProgram(program);
  
  // 设置 uniform 参数
  const uResolution = gl.getUniformLocation(program, 'uResolution');
  gl.uniform2f(uResolution, canvas.width, canvas.height);
}

{
  // 设置顶点属性
  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  
  const vertices = new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]);
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
}

const circleData = {
  m: [
    1.0,  0.0, 0.5,
  ],
  a: [
    0.0,  0.0, 0.7,
    -1.0, 0.0, 0.35,
  ]
};
  
const numCircles = gl.getUniformLocation(program, 'numCircles');
const uCircles = gl.getUniformLocation(program, 'uCircles');


gl.useProgram(displayProgram);
const numCircles_dis = gl.getUniformLocation(displayProgram, 'numCircles');
const uCircles_dis = gl.getUniformLocation(displayProgram, 'uCircles');

let times = 0;

function updateData(){
  //circleData.a[2] += 0.001;
  circleData.m[0] += -0.001;
  //if( (++times)%1000 == 0 ) console.log(times);
  gl.uniform1i(numCircles, circleData.a.length/3);
  gl.uniform3fv(uCircles, circleData.a);
}

function updateData_dis(){
  //circleData[0] += -0.001;
  //if( (++times)%1000 == 0 ) console.log(times);
  gl.uniform1i(numCircles_dis, circleData.m.length/3);
  gl.uniform3fv(uCircles_dis, circleData.m);
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
  updateData_dis();

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