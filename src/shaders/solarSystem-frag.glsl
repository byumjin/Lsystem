#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform mat4 u_Model;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform sampler2D u_DiffuseMap;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec2 fs_Uv;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

void main()
{
    vec4 black = vec4(0, 0, 0, 1);
    vec4 floor = vec4(0.4, 0.2, 0.14, 1);

    float alpha = smoothstep(0.0, 1.0, sqrt(fs_Pos.x * fs_Pos.x + fs_Pos.z * fs_Pos.z) / 35.0);

    out_Col = mix(floor, black, alpha);
}
