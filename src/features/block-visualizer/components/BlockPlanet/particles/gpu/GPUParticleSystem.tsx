import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { createPositionTexture } from "./createDataTexture";
import { createSimulationMaterial } from "./gpuSimulationMaterial";
import { createRenderMaterial } from "./gpuRenderMaterial";
import { createHistoryMaterial } from "./gpuHistoryMaterial";
import { createTrailLineMaterial } from "./gpuTrailLineMaterial";

interface GPUParticleSystemProps {
  count: number;
  radius: number;
  color: string;

  // data mapping（可选）
  seed?: number;
  noiseScale?: number;
  noiseStrength?: number;
  flowSpeed?: number;

  // life / respawn（可选）
  lifeDecay?: number;
  boundsRadius?: number;
  respawnRadius?: number;

  // trails LOD（可选）
  pointSize?: number;
  enableTrails?: boolean;
  historyLength?: number; // >=2
  particleStep?: number; // >=1
  segmentStep?: number; // >=1
  lineIntensity?: number; // 0~?
}

export const GPUParticleSystem: React.FC<GPUParticleSystemProps> = ({
  count,
  radius,
  color,

  seed = 0,
  noiseScale = 0.65,
  noiseStrength = 0.9,
  flowSpeed = 0.45,

  lifeDecay = 0.25,
  boundsRadius,
  respawnRadius,

  pointSize = 2.6,
  enableTrails = true,
  historyLength = 32,
  particleStep = 1,
  segmentStep = 1,
  lineIntensity = 1.0,
}) => {
  const { gl } = useThree();

  const texSize = Math.ceil(Math.sqrt(Math.max(1, count)));
  const effectiveCount = texSize * texSize;

  // --- materials ---
  const simMaterial = useMemo(() => createSimulationMaterial(), []);
  const pointMaterial = useMemo(() => createRenderMaterial(color), [color]);

  const historyMat = useMemo(() => createHistoryMaterial(), []);
  const lineMaterial = useMemo(() => createTrailLineMaterial(color), [color]);

  // --- simulation RT ping-pong ---
  const simA = useMemo(
    () =>
      new THREE.WebGLRenderTarget(texSize, texSize, {
        type: THREE.FloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false,
        stencilBuffer: false,
      }),
    [texSize]
  );
  const simB = useMemo(
    () =>
      new THREE.WebGLRenderTarget(texSize, texSize, {
        type: THREE.FloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false,
        stencilBuffer: false,
      }),
    [texSize]
  );
  const simPing = useRef(simA);
  const simPong = useRef(simB);

  const initTex = useMemo(
    () => createPositionTexture(texSize, radius),
    [texSize, radius]
  );
  const initDone = useRef(false);

  const simPass = useMemo(() => {
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial));
    return { scene, cam };
  }, [simMaterial]);

  // --- points geometry (uv per particle) ---
  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const n = effectiveCount;

    const positions = new Float32Array(n * 3);
    const uvs = new Float32Array(n * 2);

    let i = 0;
    for (let y = 0; y < texSize; y++) {
      for (let x = 0; x < texSize; x++) {
        positions[i * 3 + 0] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;

        uvs[i * 2 + 0] = (x + 0.5) / texSize;
        uvs[i * 2 + 1] = (y + 0.5) / texSize;
        i++;
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    return geo;
  }, [effectiveCount, texSize]);

  // --- history atlas RT ping-pong (for true trails) ---
  const maxTexSize = gl.capabilities.maxTextureSize;
  const safeHistoryLen = Math.max(
    2,
    Math.min(historyLength, Math.floor(maxTexSize / texSize))
  );
  const atlasW = texSize;
  const atlasH = texSize * safeHistoryLen;

  const histA = useMemo(
    () =>
      new THREE.WebGLRenderTarget(atlasW, atlasH, {
        type: THREE.FloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false,
        stencilBuffer: false,
      }),
    [atlasW, atlasH]
  );
  const histB = useMemo(
    () =>
      new THREE.WebGLRenderTarget(atlasW, atlasH, {
        type: THREE.FloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false,
        stencilBuffer: false,
      }),
    [atlasW, atlasH]
  );
  const histPing = useRef(histA);
  const histPong = useRef(histB);

  const historyPass = useMemo(() => {
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), historyMat));
    return { scene, cam };
  }, [historyMat]);

  // --- lineSegments geometry (subsample particles & segments) ---
  const linesGeometry = useMemo(() => {
    const ps = Math.max(1, particleStep);
    const ss = Math.max(1, segmentStep);
    const segCount = Math.max(1, safeHistoryLen - 1);

    const positions: number[] = [];
    const uvs: number[] = [];
    const slices: number[] = [];

    for (let y = 0; y < texSize; y += ps) {
      for (let x = 0; x < texSize; x += ps) {
        const u = (x + 0.5) / texSize;
        const v = (y + 0.5) / texSize;

        for (let k = 0; k < segCount; k += ss) {
          // A
          positions.push(0, 0, 0);
          uvs.push(u, v);
          slices.push(k);

          // B
          positions.push(0, 0, 0);
          uvs.push(u, v);
          slices.push(k + 1);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setAttribute(
      "aUv",
      new THREE.Float32BufferAttribute(uvvsanitize(uvs), 2)
    );
    geo.setAttribute("aSlice", new THREE.Float32BufferAttribute(slices, 1));
    return geo;

    function uvvsanitize(arr: number[]) {
      // 防御：避免 NaN/Infinity（极端情况下）
      for (let i = 0; i < arr.length; i++) {
        if (!Number.isFinite(arr[i])) arr[i] = 0;
      }
      return arr;
    }
  }, [particleStep, segmentStep, safeHistoryLen, texSize]);

  const bounds = boundsRadius ?? radius * 1.25;
  const respawn = respawnRadius ?? radius * 1.0;

  useFrame((state, delta) => {
    // ✅ 改回“真实时间”
    const t = state.clock.elapsedTime;
    const dt = delta;

    // --- simulation uniforms ---
    simMaterial.uniforms.uTime.value = t;
    simMaterial.uniforms.uDelta.value = dt;
    simMaterial.uniforms.uResolution.value.set(texSize, texSize);

    simMaterial.uniforms.uSeed.value = seed;
    simMaterial.uniforms.uBoundsRadius.value = bounds;
    simMaterial.uniforms.uRespawnRadius.value = respawn;
    simMaterial.uniforms.uLifeDecay.value = lifeDecay;

    simMaterial.uniforms.uNoiseScale.value = noiseScale;
    simMaterial.uniforms.uNoiseStrength.value = noiseStrength;
    simMaterial.uniforms.uFlowSpeed.value = flowSpeed;

    simMaterial.uniforms.uPositions.value = initDone.current
      ? simPing.current.texture
      : initTex;

    gl.setRenderTarget(simPong.current);
    gl.render(simPass.scene, simPass.cam);
    gl.setRenderTarget(null);

    initDone.current = true;

    // swap sim
    {
      const tmp = simPing.current;
      simPing.current = simPong.current;
      simPong.current = tmp;
    }

    // points sample latest
    pointMaterial.uniforms.uPositions.value = simPing.current.texture;
    if ((pointMaterial.uniforms as any).uPointSize) {
      (pointMaterial.uniforms as any).uPointSize.value = pointSize;
    }

    // --- true trails history update ---
    if (enableTrails) {
      historyMat.uniforms.uCurrent.value = simPing.current.texture;
      historyMat.uniforms.uPrev.value = histPing.current.texture;
      historyMat.uniforms.uHistoryLen.value = safeHistoryLen;
      historyMat.uniforms.uResolution.value.set(atlasW, atlasH);
      historyMat.uniforms.uMaxJump.value = Math.max(0.35, respawn * 0.4);

      gl.setRenderTarget(histPong.current);
      gl.render(historyPass.scene, historyPass.cam);
      gl.setRenderTarget(null);

      // swap history
      {
        const tmp = histPing.current;
        histPing.current = histPong.current;
        histPong.current = tmp;
      }

      lineMaterial.uniforms.uHistory.value = histPing.current.texture;
      lineMaterial.uniforms.uTexSize.value = texSize;
      lineMaterial.uniforms.uHistoryLen.value = safeHistoryLen;
      lineMaterial.uniforms.uIntensity.value = lineIntensity;
      lineMaterial.uniforms.uMaxJump.value = historyMat.uniforms.uMaxJump.value;
    }
  });

  return (
    <>
      <points geometry={pointsGeometry}>
        <primitive attach="material" object={pointMaterial} />
      </points>

      {enableTrails && (
        <lineSegments geometry={linesGeometry}>
          <primitive attach="material" object={lineMaterial} />
        </lineSegments>
      )}
    </>
  );
};
