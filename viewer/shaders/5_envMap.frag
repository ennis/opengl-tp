#version 410
#define M_PI 3.14159265358979323846

uniform sampler2D envMap;
uniform mat4 lightMatrix;
uniform bool transparent;
uniform float eta;

in vec4 vertColor;
in vec3 vertNormal;
in vec3 eyeVector;
in vec3 lightVector;

out vec4 fragColor;

// direction in world space
vec4 sampleEnvmap(vec3 Dn)
{
    float theta = acos(Dn.y)/M_PI;
    float phi = atan(Dn.z,Dn.x)/(2*M_PI)+0.5;
    return texture(envMap,vec2(phi,1.0-theta));
   // return vec4(phi, theta, 0.0, 1.0);
}

float fresnel(float eta, float cosTheta)
{
    float R0 = (1.0-eta)*(1.0-eta) / ((1.0+eta)*(1.0+eta));
    float m = 1.0 - cosTheta;
    return R0 + (1.0 - R0)*m*m*m*m*m;
}

void main( void )
{
    vec3 Nn = normalize(vertNormal);
    vec3 Vn = normalize(eyeVector);
    // Here begins the real work.
    vec4 Creflected = sampleEnvmap(reflect(-Vn, Nn));
    vec3 Rrn = refract(-Vn, Nn, 1.0/eta);
    vec4 Crefracted = sampleEnvmap(Rrn);
    float F = fresnel(eta, max(0.0,dot(Nn, Vn)));
    if (transparent && dot(Rrn, Rrn) != 0.0)
        fragColor = mix(Crefracted, Creflected, F);
    else
        // non transparent or total internal reflection
        fragColor = Creflected * F;
}
