import * as THREE from "three";

export function createHistoryMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCurrent: { value: null as THREE.Texture | null }, // texSize x texSize
      uPrev: { value: null as THREE.Texture | null }, // texSize x (texSize*historyLen)
      uHistoryLen: { value: 32.0 },
      uResolution: { value: new THREE.Vector2(1, 1) }, // atlas resolution
      uMaxJump: { value: 0.5 }, // distance threshold to treat as teleport
    },
    vertexShader: `
      void main() { gl_Position = vec4(position, 1.0); }
    `,
    fragmentShader: `
      precision highp float;

      uniform sampler2D uCurrent;
      uniform sampler2D uPrev;
      uniform float uHistoryLen;
      uniform vec2 uResolution;
      uniform float uMaxJump;

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        float sliceH = 1.0 / uHistoryLen;
        vec2 baseUv = vec2(uv.x, fract(uv.y * uHistoryLen)); // 对应当前粒子的 uv

        vec4 cur = texture2D(uCurrent, baseUv);
        vec4 prevHead = texture2D(uPrev, vec2(uv.x, baseUv.y * sliceH));
        float prevLife = prevHead.w;
        float jump = distance(cur.xyz, prevHead.xyz);
        bool respawned = (cur.w > prevLife + 1e-4) || (jump > uMaxJump);

        // 写入最新 slice，或在 respawn 时清空整列历史，避免尾迹连到旧位置
        if (uv.y < sliceH || respawned) {
          gl_FragColor = cur;
          return;
        }

        // slice 1..：从上一帧 history 的 slice-1 采样（整体下移一层）
        vec2 uvPrev = vec2(uv.x, uv.y - sliceH);
        gl_FragColor = texture2D(uPrev, uvPrev);
      }
    `,
  });
}
