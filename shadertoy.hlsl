// The MIT License
// Copyright © 2020 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


// Signed distance to a disk

// List of some other 2D distances: https://www.shadertoy.com/playlist/MXdSRf
//
// and iquilezles.org/articles/distfunctions2d


float sdCircle( in vec2 p, in vec2 o, in float r ) 
{
    return length(p - o)-r;
}

float opSmoothUnionn( float d1, float d2, float k ) {
    return min(d1, d2);
}

float opSmoothUnion( float d1, float d2, float k ) {
    float alpha = clamp( 0.5 + (d2 - d1)/(2.0*k), 0.0, 1.0 );
    return (1.0-alpha)*d2 + alpha*(d1) - k*alpha*(1.0-alpha);
}

float opSmoothSub( float d1, float d2, float k ) {
    float alpha = clamp( 0.5 + (d2 + d1)/(2.0*k), 0.0, 1.0 );
    return (1.0-alpha)*d2 + alpha*(-d1) - k*alpha*(1.0-alpha);
}

void calc(in vec2 p, out float d){
        float d1 = sdCircle(p,vec2(1.0, 0.0),0.5);
        
        
        float d2 = sdCircle(p,vec2(0.0, 0.0),0.6);
        float d3 = sdCircle(p,vec2(-1.0, 0.0),0.35);
    
    d = opSmoothUnion(d1, d2, 0.5);
    d = -opSmoothSub(d, d3, 0.5);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
        vec2 p = (2.0*fragCoord-iResolution.xy)/iResolution.y;
    vec2 m = (2.0*iMouse.xy-iResolution.xy)/iResolution.y;

    float d;
    
    calc(p, d);
    
        // coloring
    vec3 col = (d>0.0) ? vec3(0.9,0.6,0.3) : vec3(0.65,0.85,1.0);
    col *= 1.0 - exp(-6.0*abs(d));
        col *= 0.8 + 0.2*cos(150.0*d);
        col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.01,abs(d)) );

    if( iMouse.z>0.001 )
    {
        calc(m, d);
        col = mix(col, vec3(1.0,1.0,0.0), 1.0-smoothstep(0.0, 0.005, abs(length(p-m)-abs(d))-0.0025));
        col = mix(col, vec3(1.0,1.0,0.0), 1.0-smoothstep(0.0, 0.005, length(p-m)-0.015));
    }

        fragColor = vec4(col,1.0);
}
