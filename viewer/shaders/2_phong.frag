#version 410

uniform float lightIntensity;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;

in vec4 eyeVector;
in vec4 lightVector;
in vec3 vertNormal;
in vec4 vertColor;

out vec4 fragColor;

void main( void )
{
    vec4 normalizedLightVector = normalize(lightVector),
         normalizedNormal = normalize(vec4(vertNormal, 0.0)),
         normalizedEyeVector = normalize(eyeVector);

    // Ambient
    float ka = 0.2;
    vec4 ambient = ka * lightIntensity * vertColor;

    // Diffuse
    float kd = 0.3;
    vec4 diffuse = kd * max(dot(normalizedNormal, normalizedLightVector), 0.0) * vertColor;

    // Specular
    float ks = 0.4;
    vec4 reflectedRay = reflect(-normalizedLightVector, normalizedNormal);
    vec4 specular = ks * pow(max(dot(reflectedRay, normalizedEyeVector), 0.0), shininess) * vertColor;

    fragColor = ambient + diffuse + specular;
}