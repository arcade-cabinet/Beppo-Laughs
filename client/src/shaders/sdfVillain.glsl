// SDF Ray Marching Shader for Surreal Villain Rendering
// Creates melting, morphing, uncanny valley effects

// Signed Distance Functions

// Sphere
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

// Box
float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Torus
float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

// Cylinder
float sdCylinder(vec3 p, float h, float r) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

// Smooth union
float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
}

// Smooth subtraction
float opSmoothSubtraction(float d1, float d2, float k) {
    float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
    return mix(d2, -d1, h) + k * h * (1.0 - h);
}

// Domain distortion for melting effect
vec3 meltDistort(vec3 p, float time, float intensity) {
    float melt = sin(p.y * 3.0 + time) * intensity;
    melt += sin(p.x * 5.0 + time * 1.3) * intensity * 0.5;
    p.x += melt * 0.1;
    p.z += cos(p.y * 4.0 + time * 0.7) * intensity * 0.1;
    return p;
}

// Noise function for organic distortion
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = i.x + i.y * 57.0 + i.z * 113.0;
    return mix(
        mix(
            mix(fract(sin(n) * 43758.5453), fract(sin(n + 1.0) * 43758.5453), f.x),
            mix(fract(sin(n + 57.0) * 43758.5453), fract(sin(n + 58.0) * 43758.5453), f.x),
            f.y
        ),
        mix(
            mix(fract(sin(n + 113.0) * 43758.5453), fract(sin(n + 114.0) * 43758.5453), f.x),
            mix(fract(sin(n + 170.0) * 43758.5453), fract(sin(n + 171.0) * 43758.5453), f.x),
            f.y
        ),
        f.z
    );
}

// Creepy clown face SDF
float sdClownFace(vec3 p, float time, float fearLevel) {
    float distortion = fearLevel * 0.5;
    p = meltDistort(p, time, distortion);
    
    // Head - slightly squashed sphere
    float head = sdSphere(p * vec3(1.0, 0.9, 1.0), 0.5);
    
    // Eyes - sunken spheres
    vec3 eyeL = p - vec3(-0.15, 0.1, 0.35);
    vec3 eyeR = p - vec3(0.15, 0.1, 0.35);
    
    // Eyes bulge more at high fear
    float eyeScale = 0.08 + distortion * 0.05;
    float eyeL_sdf = sdSphere(eyeL, eyeScale);
    float eyeR_sdf = sdSphere(eyeR, eyeScale);
    
    // Eye sockets
    float socketL = sdSphere(eyeL, 0.12);
    float socketR = sdSphere(eyeR, 0.12);
    head = opSmoothSubtraction(socketL, head, 0.05);
    head = opSmoothSubtraction(socketR, head, 0.05);
    
    // Nose - bulbous
    vec3 noseP = p - vec3(0.0, -0.05, 0.4);
    float nose = sdSphere(noseP, 0.1 + sin(time * 5.0) * 0.02 * distortion);
    head = opSmoothUnion(head, nose, 0.1);
    
    // Mouth - wide grin that gets wider with fear
    vec3 mouthP = p - vec3(0.0, -0.25, 0.3);
    mouthP.x *= 0.6 + distortion * 0.3; // Stretches with fear
    float mouth = sdBox(mouthP, vec3(0.25 + distortion * 0.1, 0.05, 0.1));
    head = opSmoothSubtraction(mouth, head, 0.05);
    
    // Eyeballs
    float eyes = min(eyeL_sdf, eyeR_sdf);
    
    return opSmoothUnion(head, eyes, 0.02);
}

// Full villain body SDF
float sdVillain(vec3 p, float time, float fearLevel) {
    float d = 1e10;
    
    // Clown face/head
    vec3 headP = p - vec3(0.0, 1.5, 0.0);
    d = sdClownFace(headP, time, fearLevel);
    
    // Body - cylindrical with cloth-like distortion
    vec3 bodyP = p - vec3(0.0, 0.8, 0.0);
    bodyP = meltDistort(bodyP, time * 0.5, fearLevel * 0.3);
    float body = sdCylinder(bodyP, 0.5, 0.3);
    d = opSmoothUnion(d, body, 0.1);
    
    // Legs - thin cylinders
    vec3 legL = p - vec3(-0.15, 0.2, 0.0);
    vec3 legR = p - vec3(0.15, 0.2, 0.0);
    legL = meltDistort(legL, time * 0.7, fearLevel * 0.2);
    legR = meltDistort(legR, time * 0.8, fearLevel * 0.2);
    float legs = min(sdCylinder(legL, 0.3, 0.08), sdCylinder(legR, 0.3, 0.08));
    d = opSmoothUnion(d, legs, 0.05);
    
    // Arms - reaching out creepily
    vec3 armL = p - vec3(-0.5, 1.0, 0.2);
    vec3 armR = p - vec3(0.5, 1.0, 0.2);
    armL = meltDistort(armL, time * 1.2, fearLevel * 0.4);
    armR = meltDistort(armR, time * 1.1, fearLevel * 0.4);
    float arms = min(sdCylinder(armL.yxz, 0.35, 0.06), sdCylinder(armR.yxz, 0.35, 0.06));
    d = opSmoothUnion(d, arms, 0.05);
    
    // Organic noise distortion for uncanny feel
    d += noise(p * 8.0 + time) * 0.02 * (1.0 + fearLevel);
    
    return d;
}

// Ray march the scene
float rayMarch(vec3 ro, vec3 rd, float time, float fearLevel) {
    float d = 0.0;
    for (int i = 0; i < 100; i++) {
        vec3 p = ro + rd * d;
        float dist = sdVillain(p, time, fearLevel);
        if (dist < 0.001) break;
        if (d > 100.0) break;
        d += dist;
    }
    return d;
}

// Calculate normal
vec3 calcNormal(vec3 p, float time, float fearLevel) {
    const float h = 0.001;
    vec2 k = vec2(1.0, -1.0);
    return normalize(
        k.xyy * sdVillain(p + k.xyy * h, time, fearLevel) +
        k.yyx * sdVillain(p + k.yyx * h, time, fearLevel) +
        k.yxy * sdVillain(p + k.yxy * h, time, fearLevel) +
        k.xxx * sdVillain(p + k.xxx * h, time, fearLevel)
    );
}
