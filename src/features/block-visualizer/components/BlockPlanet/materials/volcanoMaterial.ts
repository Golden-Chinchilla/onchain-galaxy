import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

/**
 * 喷发柱材质（过渡版）：
 * - 每个实例有不同的相位/高度/速度（通过 instanceMatrix + uTime 实现）
 * - alpha 由“上升生命周期”控制：底部更亮，上升后消散
 * - 给 Bloom 提供稳定高亮（不要整坨发白）
 */
export const VolcanoMaterial = shaderMaterial(
  {
    uTime: 0,
    uSeed: 0,
    uColor: new THREE.Color("#fb923c"),
    uIntensity: 1.0,
    uHeight: 2.2, // 喷发高度（会在 VolcanoLayer 里按 config 调）
  },
  // vertex
  /* glsl */ `
    precision highp float;

    uniform float uTime;
    uniform float uSeed;
    uniform float uHeight;

    varying float vLife;
    varying float vFade;

    // 简单 hash（稳定即可）
    float hash(float x) { return fract(sin(x) * 43758.5453123); }

    void main() {
      vec3 pos = position;

      // 每个实例都有 instanceMatrix，我们用其中的平移分量作为随机源
      vec3 instPos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);

      float idSeed = hash(dot(instPos, vec3(12.9898, 78.233, 37.719)) + uSeed * 19.0);
      float speed = mix(0.45, 1.25, idSeed);     // 每束喷发速度
      float phase = idSeed * 10.0;

      // life: 0~1 循环上升
      float life = fract(uTime * speed + phase);
      vLife = life;

      // 上升：y 增加，越往上越细/越淡
      pos.y += life * uHeight;

      // 让喷发柱上端更细一点（类似喷焰）
      float taper = mix(1.0, 0.4, life);
      pos.x *= taper;
      pos.z *= taper;

      // fade：越靠近顶端越淡，底部更亮
      vFade = smoothstep(1.0, 0.0, life);

      // 变换到实例空间
      vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  // fragment
  /* glsl */ `
    precision highp float;

    uniform vec3 uColor;
    uniform float uIntensity;

    varying float vLife;
    varying float vFade;

    void main() {
      // 底部更亮，上升后淡出
      float core = pow(vFade, 1.4);
      float a = core * uIntensity;

      // soft clamp，避免 Bloom 把整束喷发糊白
      a = clamp(a, 0.0, 0.9);

      gl_FragColor = vec4(uColor, a);
    }
  `
);
