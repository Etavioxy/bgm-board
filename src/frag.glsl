precision highp float;

uniform vec2 uResolution;

#define MAX_CIRCLES 200

uniform int numCircles; // 圆的数量
uniform vec3 uCircles[MAX_CIRCLES]; // 最大圆的数量

float sdCircle( in vec2 p, in vec2 o, in float r ) {
    return length(p - o)-r;
}
    
float opSmoothUnion( float sumexp, float k ) {
    return -log(max(0.0001,sumexp)) / k;
}

void calc(in vec2 p, out float res){
    float k = 10.0;
    float sumexp = 0.0;

    for (int i = 0; i < MAX_CIRCLES; i++) {
        if ( i == numCircles ) break;
        vec2 center = uCircles[i].xy;
        float radius = uCircles[i].z;
        float d = sdCircle(p, center, radius);
        if ( i == 0 ) {
            sumexp -= exp(-k*d);
            continue;
        }
        sumexp += exp(-k*d);
    }
    
    res = opSmoothUnion(sumexp, k);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y * 2.0;

    float d;

    calc(uv, d);
    
    gl_FragColor.r = d;
    return;

}
