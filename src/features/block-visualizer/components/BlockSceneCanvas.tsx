import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import type { PlanetConfig } from "../types";
import { BlockPlanet } from "./BlockPlanet";

interface BlockSceneCanvasProps {
  planet: PlanetConfig;
}

export const BlockSceneCanvas: React.FC<BlockSceneCanvasProps> = ({
  planet,
}) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} shadows>
        <color attach="background" args={["#020617"]} />
        <fog attach="fog" args={["#020617", 12, 40]} />

        <ambientLight intensity={0.3} />
        <directionalLight position={[8, 10, 5]} intensity={1.2} castShadow />
        <pointLight position={[-6, -4, -6]} intensity={0.4} />

        <Stars
          radius={80}
          depth={40}
          count={1200}
          factor={4}
          fade
          speed={0.4}
        />

        <Suspense fallback={null}>
          <group rotation={[0.4, 0.7, 0]}>
            <BlockPlanet config={planet} />
          </group>

          <OrbitControls
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minDistance={6}
            maxDistance={18}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
