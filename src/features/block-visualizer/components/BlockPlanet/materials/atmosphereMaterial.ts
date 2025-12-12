import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

/**
 * 设计目标：
 * - 更干净的 Fresnel 边缘辉光（给 Bloom 提供“明确高亮边缘”）
 * - 内层偏散射（alpha 更稳，避免整球发灰）
 * - 支持 seed 轻微扰动（同区块稳定）
 */
export const AtmosphereMaterial = shaderMaterial(
  {
    uTime: 0,
    uSeed: 0,
    uColor: new THREE.Color("#38bdf8"),
    uIntensity: 1.0,
    uFresnelPower: 3.0,
    uAlpha: 0.4,
    uNoiseScale: 1.6,
    uNoiseStrength: 0.12,
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
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uFresnelPower;
    uniform float uAlpha;
    uniform float uNoiseScale;
    uniform float uNoiseStrength;

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

    void main() {
      vec3 N = normalize(vNormalW);
      vec3 V = normalize(cameraPosition - vPosW);

      // Fresnel：边缘辉光主来源（干净）
      float fres = pow(1.0 - max(dot(N, V), 0.0), uFresnelPower);

      // 轻微噪声扰动，让辉光不那么“塑料”，但保持稳定
      vec3 p = vPosW * uNoiseScale + vec3(uSeed * 10.0) + vec3(uTime * 0.05);
      float n = noise(p);
      float wobble = 1.0 + (n - 0.5) * 2.0 * uNoiseStrength;

      // alpha：以 fres 为主，避免整球泛白
      float a = fres * uAlpha * uIntensity * wobble;

      // 防止 additive 下过曝扩散：做一个 soft clamp
      a = clamp(a, 0.0, 0.9);

      gl_FragColor = vec4(uColor, a);
    }
  `
);
