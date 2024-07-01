// 初始化WebGL上下文
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

// 编译并链接着色器程序
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, document.getElementById('vertex-shader').text);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, document.getElementById('fragment-shader').text);
gl.compileShader(fragmentShader);

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
console.log(canvas.width, canvas.height);

// 绘制
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
