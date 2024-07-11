// 初始化WebGL上下文
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

// 编译并链接着色器程序

let vertexShader_text = await(await fetch('vert.glsl')).text();
let fragmentShader_text = await(await fetch('frag.glsl')).text();

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

// 绘制
//gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


// 添加显示fps功能
//const stats = new Stats();
//document.body.appendChild(stats.dom);

let times = 0;

// 渲染循环
function render() {
  // stats.begin();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  // stats.end();
  requestAnimationFrame(render);
  circleData[0] += -0.001;

  if( (++times)%100 == 0 ) console.log(times);
  gl.uniform1i(numCircles, 3);
  gl.uniform3fv(uCircles, circleData);
}
requestAnimationFrame(render);