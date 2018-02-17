#version 300 es

//This is a vertex shader. While it is called a "shader" due to outdated conventions, this file
//is used to apply matrix transformations to the arrays of vertex data passed to it.
//Since this code is run on your GPU, each vertex is transformed simultaneously.
//If it were run on your CPU, each vertex would have to be processed in a FOR loop, one at a time.
//This simultaneous transformation allows your program to run much faster, especially when rendering
//geometry with millions of vertices.

uniform mat4 u_Model;       // The matrix that defines the transformation of the
                            // object we're rendering. In this assignment,
                            // this will be the result of traversing your scene graph.

uniform mat4 u_ModelInvTr;  // The inverse transpose of the model matrix.
                            // This allows us to transform the object's normals properly
                            // if the object has been non-uniformly scaled.

uniform mat4 u_ViewProj;    // The matrix that defines the camera's transformation.
                            // We've written a static matrix for you to use for HW2,
                            // but in HW3 you'll have to generate one yourself

uniform vec2 u_TimeInfo;

uniform vec4 u_Wind;

in vec4 vs_Pos;             // The array of vertex positions passed to the shader
in vec4 vs_Nor;             // The array of vertex normals passed to the shader
in vec4 vs_Col;             // The array of vertex colors passed to the shader
in vec2 vs_Uv;

out vec4 fs_Nor;            // The array of normals that has been transformed by u_ModelInvTr. This is implicitly passed to the fragment shader.
out vec4 fs_LightVec;       // The direction in which our virtual light lies, relative to each vertex. This is implicitly passed to the fragment shader.
out vec4 fs_Col;            // The color of each vertex. This is implicitly passed to the fragment shader.
out vec2 fs_Uv;

const vec4 lightPos = vec4(5, 7, 3, 1); //The position of our virtual light, which is used to compute the shading of
                                        //the geometry in the fragment shader.

void main()
{
    fs_Col = vs_Col;
    fs_Uv = vs_Uv;
    fs_LightVec = lightPos;  
    fs_Nor = vs_Nor; //already calcuated

    vec3 windDir = normalize(u_Wind.xyz);
    float windWidth = 5.0;
    

    float branchLength = length(vs_Pos.xyz);
    vec3 upVec = normalize(vs_Pos.xyz);

    //vec3 tanVec = normalize(u_Model[0].xyz);
    vec3 tanVec = vec3(1.0, 0.0, 0.0);

    vec3 bitanVec = cross(tanVec, upVec);

    float windSpeed = 10.0;

    float windForce = cos( (dot( cross(windDir, vec3(0.0, 1.0, 0.0)) , vec3(vs_Pos.x, 0.0, vs_Pos.z)) + u_TimeInfo.x*windSpeed) * (1.0/windWidth) ) * u_Wind.w;

    vec4 vertexPos = vs_Pos + vec4( bitanVec * windForce, 0.0) * pow((branchLength * 0.015), 2.0);
    

    vec4 modelposition = u_Model * vertexPos;
    gl_Position = u_ViewProj * modelposition;
}
