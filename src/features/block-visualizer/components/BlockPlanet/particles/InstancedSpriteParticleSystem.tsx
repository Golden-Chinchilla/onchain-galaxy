import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { ParticleSystemProps } from "./types";

function randomPointInSphereShell(radius: number) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * (0.75 + Math.random() * 0.25);

  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * Math.cos(phi),
    r * sinPhi * Math.sin(theta)
  );
}

export const InstancedSpriteParticleSystem: React.FC<ParticleSystemProps> = ({
  count,
  radius,
  color,
  size = 0.06,
}) => {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { camera } = useThree();

  const baseColor = useMemo(() => new THREE.Color(color), [color]);

  // 初始化实例矩阵
  useMemo(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const p = randomPointInSphereShell(radius);

      dummy.position.copy(p);
      const s = size * (0.6 + Math.random() * 0.8);
      dummy.scale.set(s, s, s);
      dummy.rotation.set(0, 0, 0);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, radius, size]);

  // 创建 ShaderMaterial（一次）
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: baseColor },
        uOpacity: { value: 0.7 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;
        varying float vTwinkle;

        void main() {
          vUv = uv;

          vec4 worldPos = instanceMatrix * vec4(position, 1.0);
          float phase = dot(worldPos.xyz, vec3(0.12, 0.17, 0.09));
          vTwinkle = 0.6 + 0.4 * sin(uTime * 1.2 + phase);

          vec3 center = vec3(
            instanceMatrix[3][0],
            instanceMatrix[3][1],
            instanceMatrix[3][2]
          );

          float s = length(vec3(
            instanceMatrix[0][0],
            instanceMatrix[0][1],
            instanceMatrix[0][2]
          ));

          vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
          vec3 up    = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);

          vec3 pos = center + right * (position.x * s) + up * (position.y * s);

          gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;

        varying vec2 vUv;
        varying float vTwinkle;

        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float d = dot(p, p);
          float alpha = exp(-3.5 * d);

          alpha *= uOpacity * vTwinkle;
          alpha = clamp(alpha, 0.0, 0.85);

          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    materialRef.current = mat;
    return mat;
  }, [baseColor]);

  // 帧更新
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.00025;
      meshRef.current.rotation.x += 0.0001;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <primitive attach="material" object={material} />
    </instancedMesh>
  );
};
