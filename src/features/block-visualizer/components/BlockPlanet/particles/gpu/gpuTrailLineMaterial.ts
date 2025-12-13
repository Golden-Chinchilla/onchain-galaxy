import * as THREE from "three";

export function createTrailLineMaterial(color: string) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uHistory: { value: null as THREE.Texture | null },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: 1.0 },
      uTexSize: { value: 64.0 },
      uHistoryLen: { value: 32.0 },
      uMaxJump: { value: 0.5 },
    },
    vertexShader: `
      precision highp float;

      uniform sampler2D uHistory;
      uniform float uTexSize;
      uniform float uHistoryLen;

      attribute vec2 aUv;
      attribute float aSlice;

      varying vec2 vUv;
      varying float vSlice;
      varying float vAge;

      vec3 sampleHistory(vec2 baseUv, float slice) {
        // baseUv: (x+0.5)/texSize, (y+0.5)/texSize  within one slice
        float px = baseUv.x * uTexSize;
        float py = baseUv.y * uTexSize;

        float atlasU = px / uTexSize;
        float atlasV = (py + slice * uTexSize) / (uTexSize * uHistoryLen);

        return texture2D(uHistory, vec2(atlasU, atlasV)).xyz;
      }

      void main() {
        vec3 p = sampleHistory(aUv, aSlice);
        vUv = aUv;
        vSlice = aSlice;
        vAge = aSlice / max(1.0, (uHistoryLen - 1.0));

        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform sampler2D uHistory;
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform float uMaxJump;
      uniform float uTexSize;
      uniform float uHistoryLen;

      varying vec2 vUv;
      varying float vSlice;
      varying float vAge;

      vec3 sampleHistory(vec2 baseUv, float slice) {
        float px = baseUv.x * uTexSize;
        float py = baseUv.y * uTexSize;
        float atlasU = px / uTexSize;
        float atlasV = (py + slice * uTexSize) / (uTexSize * uHistoryLen);
        return texture2D(uHistory, vec2(atlasU, atlasV)).xyz;
      }

      void main() {
        vec3 p1 = sampleHistory(vUv, vSlice);
        vec3 p0 = sampleHistory(vUv, max(0.0, vSlice - 1.0));
        float segLen = length(p1 - p0);

        float lenFactor = clamp(1.0 - segLen / uMaxJump, 0.0, 1.0);

        float a = pow(1.0 - vAge, 1.6) * uIntensity * lenFactor;
        a = clamp(a, 0.0, 0.9);
        if (a <= 0.0) discard;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  });
}
