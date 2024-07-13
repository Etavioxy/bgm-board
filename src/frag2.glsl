precision mediump float;

uniform vec2 uResolution;
uniform sampler2D uTexture;

#define MAX_CIRCLES 200

uniform int numCircles; // 圆的数量
uniform vec3 uCircles[MAX_CIRCLES]; // 最大圆的数量

float sdCircle( in vec2 p, in vec2 o, in float r ) {
    return length(p - o)-r;
}
    
float opSmoothUnion( float sumexp, float k ) {
    return -log(max(0.0001,sumexp)) / k;
}

void calc(in vec2 p, in float sumexp, out float res){
    float k = 10.0;

    for (int i = 0; i < MAX_CIRCLES; i++) {
    //for (int i = 0; i < 0; i++) {
        if ( i == numCircles ) break;
        vec2 center = uCircles[i].xy;
        float radius = uCircles[i].z;
        float d = sdCircle(p, center, radius);
        sumexp -= exp(-k*d);
    }
    
    res = opSmoothUnion(sumexp, k);
}


void main() {
    vec2 texuv = gl_FragCoord.xy / uResolution;
    //gl_FragColor = vec4(opSmoothUnion(texture2D(uTexture, texuv).r, 10), 0, 0, 1);
    //gl_FragColor = vec4(texture2D(uTexture, texuv).r, 0, 0, 1);
    //return ;

    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y * 2.0;

    float d = texture2D(uTexture, texuv).r;

    calc(uv, d, d);
    
    // coloring
    vec3 col = (d>0.0) ? vec3(0.4,0.7,0.4) : vec3(0.65,0.85,1.0);
    col *= 1.0 - exp(-6.0*abs(d));
    col *= 0.8 + 0.2*cos(150.0*d);
    col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.01,abs(d)) );

    gl_FragColor = vec4(col,1.0);
}