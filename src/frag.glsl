precision highp float;

uniform vec2 uResolution;

#define MAX_CIRCLES 200

uniform int numCircles; // 圆的数量
uniform vec3 uCircles[MAX_CIRCLES]; // 最大圆的数量

float circle1(vec2 p, float radius) {
    return length(p - vec2(-0.0, 0.0)) - radius;
}

float circle2(vec2 p, float radius) {
    return length(p - vec2(0.5, 0.0)) - radius;
}

float opSmoothUnion(float d1, float d2, float k) {
    float alpha = clamp(0.5 + (d2 - d1) / (2.0 * k), 0.0, 1.0);
    return mix(d2, d1, alpha) - k * alpha * (1.0 - alpha);
}

float sdCircle( in vec2 p, in vec2 o, in float r ) 
{
    return length(p - o)-r;
}

float opSmoothUnionn( float d1, float d2, float k ) {
    return min(d1, d2);
}

    
float opSmoothUnion( float sumexp, float k ) {
    return -log(max(0.0001,sumexp)) / k;
}

void calc(in vec2 p, out float res){
    //float d1 = sdCircle(p,vec2(1.0, 0.0),0.5);
    //float d2 = sdCircle(p,vec2(0.0, 0.0),0.7);
    //float d3 = sdCircle(p,vec2(-1.0, 0.0),0.35);

    float k = 10.0;
    float sumexp = 0.0;

    for (int i = 0; i < MAX_CIRCLES; i++) {
        if ( i == numCircles ) break;
        vec2 center = uCircles[i].xy;
        float radius = uCircles[i].z;
        float d = sdCircle(p, center, radius);
        sumexp += exp(-k*d);
    }
    
    res = opSmoothUnion(sumexp, k);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y * 2.0;

    float d;

    calc(uv, d);

    // coloring
    vec3 col = (d>0.0) ? vec3(0.9,0.6,0.3) : vec3(0.65,0.85,1.0);
    col *= 1.0 - exp(-6.0*abs(d));
    col *= 0.8 + 0.2*cos(150.0*d);
    col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.01,abs(d)) );

    gl_FragColor = vec4(col,1.0);
}
