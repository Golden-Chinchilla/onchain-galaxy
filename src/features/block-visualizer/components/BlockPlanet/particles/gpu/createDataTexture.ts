import * as THREE from "three";

export function createPositionTexture(size: number, radius: number) {
  const data = new Float32Array(size * size * 4);

  for (let i = 0; i < size * size; i++) {
    const i4 = i * 4;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.7 + Math.random() * 0.3);

    data[i4 + 0] = r * Math.sin(phi) * Math.cos(theta);
    data[i4 + 1] = r * Math.cos(phi);
    data[i4 + 2] = r * Math.sin(phi) * Math.sin(theta);
    data[i4 + 3] = Math.random(); // ✅ life [0,1]
  }

  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.needsUpdate = true;
  return texture;
}
