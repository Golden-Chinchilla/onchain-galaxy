import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

export const VolcanoMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#fb923c"),
    uIntensity: 1.0,
  },
  /* vertex */ `
    uniform float uTime;
    varying float vLife;

    void main() {
      vec3 pos = position;
      float life = fract(uTime + position.y);
      pos.y += life * 2.0;
      vLife = 1.0 - life;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  /* fragment */ `
    uniform vec3 uColor;
    uniform float uIntensity;
    varying float vLife;

    void main() {
      float alpha = vLife * uIntensity;
      gl_FragColor = vec4(uColor, alpha);
    }
  `
);
