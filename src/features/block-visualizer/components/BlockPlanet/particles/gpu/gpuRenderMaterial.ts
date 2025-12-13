import * as THREE from "three";

export function createRenderMaterial(color: string) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uPositions: { value: null as THREE.Texture | null },
      uColor: { value: new THREE.Color(color) },
      uPointSize: { value: 2.6 },
    },
    vertexShader: `
      uniform sampler2D uPositions;
      uniform float uPointSize;
      varying float vAlpha;

      void main() {
        vec4 pos = texture2D(uPositions, uv);
        vec4 mv = modelViewMatrix * vec4(pos.xyz, 1.0);
        gl_Position = projectionMatrix * mv;

        gl_PointSize = uPointSize;
        vAlpha = 1.0;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      uniform vec3 uColor;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor, a * vAlpha);
      }
    `,
  });
}
