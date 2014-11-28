#version 410

uniform float lightIntensity;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;
uniform sampler2D shadowMap;

in vec4 eyeVector;
in vec4 lightVector;
in vec3 vertNormal;
in vec4 vertColor;
in vec3 lightSpace;

out vec4 fragColor;

float fresnel(float eta, float cosTheta)
{
    float R0 = (1.0-eta)*(1.0-eta) / ((1.0+eta)*(1.0+eta));
    float m = 1.0 - cosTheta;
    return R0 + (1.0 - R0)*m*m*m*m*m;
}

void main( void )
{
    vec4 normalizedLightVector = normalize(lightVector),
         normalizedNormal = normalize(vec4(vertNormal, 0.0)),
         normalizedEyeVector = normalize(eyeVector);
    vec4 H = normalize(normalizedLightVector + normalizedEyeVector);
    // Ambient
    float ka = 0.2;
    vec4 ambient = ka * lightIntensity * vertColor;
    // Diffuse
    float kd = 0.3;
    vec4 diffuse = kd * max(dot(normalizedNormal, normalizedLightVector), 0.0) * vertColor;
    // Specular
    float ks = 0.4;
    vec4 specular;
    if (blinnPhong) {
      specular = ks * vertColor * pow(max(dot(normalizedNormal, H), 0.0), 4 * shininess) * lightIntensity;
    } else {
    vec4 reflectedRay = reflect(-normalizedLightVector, normalizedNormal);
      specular = ks * vertColor * pow(max(dot(reflectedRay, normalizedEyeVector), 0.0), shininess) * lightIntensity;
    }
    specular *= fresnel(eta, dot(H, normalizedEyeVector));

    vec2 bla;
    bla.x = 0.5*(1+lightSpace.x);
    bla.y = 1 - 0.5*(1+lightSpace.y);
    float shadow = 2*texture(shadowMap, bla).z-1;
    if (shadow < lightSpace.z) {
        fragColor = ambient;
    } else {
        fragColor = ambient + diffuse + specular; 
    }
    fragColor = vec4(vec3(shadow),1.0);
}
