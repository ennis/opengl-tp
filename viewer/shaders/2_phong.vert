#version 410

uniform mat4 matrix;
uniform mat4 perspective;
uniform mat3 normalMatrix;
uniform bool noColor;
uniform vec3 lightPosition;
uniform mat4 worldToLightSpace;

in vec3 vertex;
in vec3 normal;
in vec3 color;

out vec4 eyeVector;
out vec4 lightVector;
out vec4 vertColor;
out vec3 vertNormal;
out vec3 lightSpace;

void main( void )
{
    if (noColor) vertColor = vec4(0.2, 0.6, 0.7, 1.0 );
    else vertColor = vec4(color, 1.0);
    vec4 vertPosition = matrix * vec4(vertex, 1.0);
    vec4 eyePosition = vec4(0.0, 0.0, 0.0, 1.0);
    // Here begins the real work.
    eyeVector = normalize(eyePosition - vertPosition);
    lightVector = normalize(vec4(lightPosition, 1.0) - vertPosition);
    vec4 ls = (worldToLightSpace * vec4(vertex,1.0));
    lightSpace = ls.xyz / ls.w;

    vertNormal = normalize(normalMatrix * normal);
    gl_Position = perspective * vertPosition;
}
