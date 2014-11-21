#version 410
#define M_PI 3.14159265358979323846

uniform float lightIntensity;
uniform sampler2D earthDay;
uniform sampler2D earthNormals;
uniform mat3x3 normalMatrix;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;

in vec4 eyeVector;
in vec4 lightVector;
in vec4 vertColor;
in vec3 vertNormal;
in vec3 vertPos;

out vec4 fragColor;

float fresnel(float eta, float cosTheta)
{
    float R0 = (1.0-eta)*(1.0-eta) / ((1.0+eta)*(1.0+eta));
    float m = 1.0 - cosTheta;
    return R0 + (1.0 - R0)*m*m*m*m*m;
}

void main( void )
{
    // Compute texture coordinates
    float r = length(vertPos),
          phi = acos(vertPos.z / r) / M_PI,
          theta = atan(vertPos.y, vertPos.x) / (2 * M_PI) + 0.5;
    vec2 texCoords = vec2(theta, phi);
    vec4 color = texture(earthDay, texCoords);

    // Bump mapping
    vec3 ns = texture(earthNormals, texCoords).xyz;
    ns = (2 * ns - vec3(1, 1, 1));
    // Compute normal / tangent / bi-tangent
    vec3 n = normalize(vertNormal);
    // NH: here, you want to put theta (the horizontal angle) and you want it between 0 and 2*pi
    theta = atan(vertPos.y, vertPos.x) + M_PI;
    vec3 t = normalize(normalMatrix * normalize(vec3(sin(theta), -cos(theta), 0)));
    vec3 b = - normalize(cross(n, t));
    // Local frame
    mat3 localFrame = mat3(t, b, n);
    // Modified normal
    // NH: That one took me quite some time to find.
    // NH: localFrame bring ns into the "usual" coordinates.
    // NH: You don't need to invert it.
    vec3 bumpNormal = normalize(localFrame * ns);

    // illumination (phong)
    vec4 Ln = normalize(lightVector),
         Nn = normalize(vec4(bumpNormal, 0.0)),
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

    fragColor = ambient + diffuse + specular;
}
