#version 410

uniform float lightIntensity;
uniform sampler2D colorTexture;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;
uniform sampler2D shadowMap;

in vec4 eyeVector;
in vec4 lightVector;
in vec4 vertColor;
in vec3 vertNormal;
in vec2 textCoords;
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
    // sampling
    vec4 color = texture(colorTexture, textCoords);

    // illumination (phong)
    vec4 Ln = normalize(lightVector),
         Nn = normalize(vec4(vertNormal, 0.0)),
         Vn = normalize(eyeVector);
    vec4 H = normalize(Ln + Vn);
    // Ambient
    float ka = 0.2;
    vec4 ambient = ka * lightIntensity * color;
    // Diffuse
    float kd = 0.3;
    vec4 diffuse = kd * max(dot(Nn, Ln), 0.0) * color;
    // Specular
    float ks = 0.4;
    vec4 specular;
    if (blinnPhong) {
      specular = ks * color * pow(max(dot(Nn, H), 0.0), 4 * shininess) * lightIntensity;
    } else {
    vec4 R = reflect(-Ln, Nn);
      specular = ks * color * pow(max(dot(R, Vn), 0.0), shininess) * lightIntensity;
    }
    specular *= fresnel(eta, dot(H, Vn));

    vec2 bla;
    bla.x = 0.5*(1+lightSpace.x);
    bla.y = 0.5*(1+lightSpace.y);
    float shadow = 2*texture(shadowMap, bla).z-1;
    if (shadow < lightSpace.z - 0.01) {
        fragColor = ambient;
    } else {
        fragColor = ambient + diffuse + specular; 
    }
    //fragColor = vec4(lightSpace,1.0) + 0.001 * shadow;
}