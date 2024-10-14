export { Renderer };

function createShaderProgram(gl: WebGLRenderingContext, vertexShader_text: string, fragmentShader_text: string){
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertexShader, vertexShader_text);
  gl.compileShader(vertexShader);
  {
    let msg = gl.getShaderInfoLog(vertexShader);
    if( msg && msg.length > 0 ) console.error(msg);
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragmentShader, fragmentShader_text);
  gl.compileShader(fragmentShader);
  {
    let msg = gl.getShaderInfoLog(fragmentShader);
    if( msg && msg.length > 0 ) console.error(msg);
  }

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  return program;
}

function createFramebuffer(gl: WebGLRenderingContext, program: WebGLProgram, width: number, height: number): [WebGLFramebuffer, WebGLTexture] {
  gl.useProgram(program);
  const framebuffer = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  // 创建一个纹理对象并设置其尺寸
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);

  if( false ){
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); // 假设尺寸为 512x512
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, width, height, 0, gl.RED, gl.HALF_FLOAT, null); // 单通道浮点数纹理设置
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null); // 单通道浮点数纹理设置
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null); // 单通道浮点数纹理设置
  }
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // 将纹理附加到帧缓冲对象上
  if( false ){
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, texture, 0);
  } else {
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }

  // 检查帧缓冲是否附加成功
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE ) {
    if( status === gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT ) console.error('FRAMEBUFFER_INCOMPLETE_ATTACHMENT');
    else console.error('Failed to attach texture to framebuffer');
  }
  return [ framebuffer, texture ] ;
}

const vertexShader_text = await(await fetch('vert.glsl')).text();
const fragmentShader_text = await(await fetch('frag.glsl')).text();

const fragmentShader2_text = await(await fetch('frag2.glsl')).text();

class Renderer {
  private gl: WebGLRenderingContext;
  private programs: { computeProgram: WebGLProgram; displayProgram: WebGLProgram };
  private framebuffer: WebGLFramebuffer;
  private texture: WebGLTexture;
  private numCircles: WebGLUniformLocation;
  private uCircles: WebGLUniformLocation;
  private numCircles_dis: WebGLUniformLocation;
  private uCircles_dis: WebGLUniformLocation;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl') as WebGLRenderingContext;
    let gl = this.gl;
  
    const available_extensions = gl.getSupportedExtensions()!;
  
    if(!(available_extensions.includes("OES_texture_float"))){
      console.error('OES_texture_float not support!');
    }
  
    // 获取扩展？
    var depth_ext = gl.getExtension("OES_depth_texture");
    var float_ext = gl.getExtension("OES_texture_float");
    var linear_ext =  gl.getExtension("OES_texture_float_linear");
  
    // 编译并链接着色器程序
    let program = createShaderProgram(gl, vertexShader_text, fragmentShader_text);
    
    let displayProgram = createShaderProgram(gl, vertexShader_text, fragmentShader2_text);
    
    this.programs = { computeProgram: program, displayProgram: displayProgram };
    
    [ this.framebuffer, this.texture ] = createFramebuffer(gl, program, canvas.width, canvas.height);
    
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
      
    this.numCircles = gl.getUniformLocation(program, 'numCircles')!;
    this.uCircles = gl.getUniformLocation(program, 'uCircles')!;
    
    
    gl.useProgram(displayProgram);
    this.numCircles_dis = gl.getUniformLocation(displayProgram, 'numCircles')!;
    this.uCircles_dis = gl.getUniformLocation(displayProgram, 'uCircles')!;
  
  }

  render(circleData: any) {
    let gl = this.gl;
  
    // 绘制到帧缓冲
    gl.useProgram(this.programs.computeProgram);
    {
      gl.uniform1i(this.numCircles, circleData.a.length/3);
      gl.uniform3fv(this.uCircles, circleData.a);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // 解绑帧缓冲区
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
    gl.useProgram(this.programs.displayProgram);
    {
      gl.uniform1i(this.numCircles_dis, circleData.m.length/3);
      gl.uniform3fv(this.uCircles_dis, circleData.m);
    }
  
    // 绑定纹理并绘制
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  
};