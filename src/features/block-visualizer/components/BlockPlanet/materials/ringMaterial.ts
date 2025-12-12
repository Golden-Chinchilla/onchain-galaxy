import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

/**
 * 设计目标：
 * - 看起来像“星尘/冰尘环”，不是纯几何环
 * - 中心到外侧有合理衰减（让 Bloom 更可控）
 * - 条纹层次 + 颗粒噪声（细节）
 */
export const RingMaterial = shaderMaterial(
  {
    uTime: 0,
    uSeed: 0,
    uColor: new THREE.Color("#38bdf8"),
    uIntensity: 1.0,
    uBandFreq: 48.0,
    uGrainStrength: 0.35,
  },
  // vertex
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment
  /* glsl */ `
    precision highp float;

    uniform float uTime;
    uniform float uSeed;
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uBandFreq;
    uniform float uGrainStrength;

    varying vec2 vUv;

    float hash(float x) {
      return fract(sin(x) * 43758.5453123);
    }

    float hash2(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      // ringGeometry 的 uv：x 方向大致对应半径内外，y 对应角度展开
      float r = clamp(vUv.x, 0.0, 1.0);

      // 中心衰减：内外缘都更亮，中间略暗（更像尘带层次）
      float edge = smoothstep(0.0, 0.08, r) * (1.0 - smoothstep(0.92, 1.0, r));
      float centerFalloff = pow(edge, 0.55);

      // 条纹：多频 band（稳定且有层次）
      float bands1 = smoothstep(0.35, 0.65, hash(r * uBandFreq + uSeed * 19.0));
      float bands2 = smoothstep(0.25, 0.75, hash(r * (uBandFreq * 0.55) + uSeed * 7.0 + 12.3));
      float bands = mix(bands1, bands2, 0.45);

      // 颗粒：基于 uv 的细粒噪声（静态），再叠一点时间变化（很轻）
      float grain = hash2(vUv * vec2(900.0, 240.0) + uSeed * 10.0);
      grain = mix(grain, hash2(vUv * vec2(300.0, 120.0) + uTime * 0.02), 0.15);

      // alpha：条纹 * 衰减 * 颗粒
      float a = bands * centerFalloff;
      a *= (0.7 + grain * uGrainStrength);
      a *= uIntensity;

      // 避免过曝：soft clamp
      a = clamp(a, 0.0, 0.85);

      gl_FragColor = vec4(uColor, a);
    }
  `
);
