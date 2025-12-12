import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

export const PlanetSurfaceMaterial = shaderMaterial(
  {
    uTime: 0,
    uSeed: 0,
    uSurfaceColor: new THREE.Color("#0f172a"),
    uCoreColor: new THREE.Color("#5df2ff"),
    uNoiseScale: 2.4,
    uNoiseStrength: 0.35,
    uFresnelPower: 2.4,
    uFresnelIntensity: 0.6,
  },
  // vertex
  /* glsl */ `
    varying vec3 vNormalW;
    varying vec3 vPosW;

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vPosW = worldPos.xyz;
      vNormalW = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  // fragment
  /* glsl */ `
    precision highp float;

    uniform float uTime;
    uniform float uSeed;
    uniform vec3 uSurfaceColor;
    uniform vec3 uCoreColor;
    uniform float uNoiseScale;
    uniform float uNoiseStrength;
    uniform float uFresnelPower;
    uniform float uFresnelIntensity;

    varying vec3 vNormalW;
    varying vec3 vPosW;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float n000 = hash(i + vec3(0,0,0));
      float n100 = hash(i + vec3(1,0,0));
      float n010 = hash(i + vec3(0,1,0));
      float n110 = hash(i + vec3(1,1,0));
      float n001 = hash(i + vec3(0,0,1));
      float n101 = hash(i + vec3(1,0,1));
      float n011 = hash(i + vec3(0,1,1));
      float n111 = hash(i + vec3(1,1,1));

      float nx00 = mix(n000, n100, f.x);
      float nx10 = mix(n010, n110, f.x);
      float nx01 = mix(n001, n101, f.x);
      float nx11 = mix(n011, n111, f.x);

      float nxy0 = mix(nx00, nx10, f.y);
      float nxy1 = mix(nx01, nx11, f.y);

      return mix(nxy0, nxy1, f.z);
    }

    // fbm：多频噪声，电影级质感的基础
    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.1;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec3 N = normalize(vNormalW);
      vec3 V = normalize(cameraPosition - vPosW);

      // seed 影响噪声相位，保证同区块稳定
      vec3 p = vPosW * uNoiseScale + vec3(uSeed * 10.0) + vec3(uTime * 0.05);

      float f = fbm(p);

      // veins：模拟大理石矿物纹
      float veins = smoothstep(0.45, 0.75, abs(sin((f + uSeed) * 6.283)));

      vec3 baseColor = mix(uSurfaceColor, uCoreColor, veins * uNoiseStrength);

      // Fresnel 边缘光
      float fres = pow(1.0 - max(dot(N, V), 0.0), uFresnelPower);
      vec3 fresCol = uCoreColor * fres * uFresnelIntensity;

      // 简单光照（电影级会换）
      float light = 0.35 + 0.65 * max(dot(N, normalize(vec3(0.3, 0.7, 0.4))), 0.0);

      vec3 color = baseColor * light + fresCol;

      gl_FragColor = vec4(color, 1.0);
    }
  `
);
