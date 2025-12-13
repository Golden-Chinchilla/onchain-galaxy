import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

import type { PlanetConfig } from "../types";
import { BlockPlanet } from "./BlockPlanet";

interface BlockSceneCanvasProps {
  planet: PlanetConfig;
  quality?: "low" | "mid" | "high";
}

function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.05}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.85}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} exposure={1.0} />
      <Vignette eskil={false} offset={0.15} darkness={0.7} />
    </EffectComposer>
  );
}

export const BlockSceneCanvas: React.FC<BlockSceneCanvasProps> = ({
  planet,
  quality = "high",
}) => {
  const blockKey = useMemo(() => {
    const bn = (planet as any).blockNumber ?? (planet as any).blockNo ?? "";
    const seed = (planet as any).visualSeed ?? "";
    return `${bn}-${seed}-${planet.radius.toFixed(3)}`;
  }, [planet]);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{
          position: [0, 0, Math.max(10, planet.radius * 4)],
          fov: 45,
          near: 0.1,
          far: 300,
        }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#020617"]} />
        <fog attach="fog" args={["#020617", 15, 80]} />

        <ambientLight intensity={0.3} />
        <directionalLight position={[8, 10, 5]} intensity={1.1} />
        <pointLight position={[-6, -4, -6]} intensity={0.35} />

        <Stars
          radius={90}
          depth={45}
          count={1000}
          factor={4}
          fade
          speed={0.25}
        />

        <Suspense fallback={null}>
          <group rotation={[0.35, 0.65, 0]}>
            <BlockPlanet config={planet} quality={quality} />
          </group>

          <OrbitControls
            enablePan={false}
            enableDamping
            dampingFactor={0.1}
            minDistance={Math.max(6, planet.radius * 2.5)}
            maxDistance={Math.max(18, planet.radius * 7)}
          />

          {/* ✅ bloom/ACES/暗角 可实时调 */}
          <Effects />
        </Suspense>
      </Canvas>
    </div>
  );
};
