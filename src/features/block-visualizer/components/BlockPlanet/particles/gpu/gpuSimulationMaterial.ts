import * as THREE from "three";

export function createSimulationMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPositions: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uDelta: { value: 0 },

      // ✅ 必须：用于 gl_FragCoord 归一化
      uResolution: { value: new THREE.Vector2(1, 1) },

      // ✅ 粒子循环
      uSeed: { value: 0 },
      uBoundsRadius: { value: 20.0 },
      uRespawnRadius: { value: 16.0 },
      uLifeDecay: { value: 0.25 },

      // ✅ curl noise 流场
      uNoiseScale: { value: 0.65 },
      uNoiseStrength: { value: 0.9 },
      uFlowSpeed: { value: 0.45 },
    },

    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,

    fragmentShader: `
      precision highp float;

      uniform sampler2D uPositions;
      uniform float uTime;
      uniform float uDelta;
      uniform vec2  uResolution;

      uniform float uSeed;
      uniform float uBoundsRadius;
      uniform float uRespawnRadius;
      uniform float uLifeDecay;

      uniform float uNoiseScale;
      uniform float uNoiseStrength;
      uniform float uFlowSpeed;

      // ---------- Simplex Noise (3D) ----------
      vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod(i, 289.0);
        vec4 p = permute(
          permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0)
        );

        float n_ = 1.0 / 7.0;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.y;
        vec4 y = y_ * ns.x + ns.y;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;

        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      // ---------- Curl Noise ----------
      vec3 curlNoise(vec3 p) {
        float e = 0.12;

        float nx1 = snoise(p + vec3(e, 0.0, 0.0));
        float nx2 = snoise(p - vec3(e, 0.0, 0.0));
        float ny1 = snoise(p + vec3(0.0, e, 0.0));
        float ny2 = snoise(p - vec3(0.0, e, 0.0));
        float nz1 = snoise(p + vec3(0.0, 0.0, e));
        float nz2 = snoise(p - vec3(0.0, 0.0, e));

        float x = (ny1 - ny2) - (nz1 - nz2);
        float y = (nz1 - nz2) - (nx1 - nx2);
        float z = (nx1 - nx2) - (ny1 - ny2);

        return normalize(vec3(x, y, z));
      }

      float hash12(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void respawn(inout vec4 pos, vec2 uv) {
        float t = floor(uTime * 60.0);
        float a = hash12(uv + vec2(uSeed, t));
        float b = hash12(uv + vec2(t, uSeed));

        float theta = a * 6.2831853;
        float z = b * 2.0 - 1.0;
        float s = sqrt(max(0.0, 1.0 - z*z));
        vec3 dir = vec3(s*cos(theta), z, s*sin(theta));

        float rr = uRespawnRadius * (0.75 + 0.25 * fract(a * 13.37));
        pos.xyz = dir * rr;
        pos.w = 1.0;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec4 pos = texture2D(uPositions, uv);

        // life 消耗
        pos.w -= uDelta * uLifeDecay;

        // curl flow
        vec3 p = pos.xyz * uNoiseScale + vec3(0.0, uTime * 0.15, 0.0);
        vec3 flow = curlNoise(p) * uNoiseStrength;
        pos.xyz += flow * uFlowSpeed * uDelta;

        // 越界/死亡 -> 重生
        float r = length(pos.xyz);
        if (pos.w <= 0.0 || r > uBoundsRadius) {
          respawn(pos, uv);
        }

        gl_FragColor = pos;
      }
    `,
  });
}
