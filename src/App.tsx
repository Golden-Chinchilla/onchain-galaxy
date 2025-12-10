// src/App.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // 场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020617"); // slate-950

    // 相机
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // 立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: "#38bdf8" });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 光源
    const light = new THREE.DirectionalLight("#ffffff", 1.5);
    light.position.set(2, 2, 3);
    scene.add(light);

    const ambient = new THREE.AmbientLight("#ffffff", 0.2);
    scene.add(ambient);

    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.015;
      renderer.render(scene, camera);
    };

    animate();

    // 清理
    return () => {
      cancelAnimationFrame(frameId);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Three.js Lab</h1>
        <span className="text-xs text-slate-400">
          React 19 · Tailwind v4 · webpack 5 · TypeScript
        </span>
      </header>

      <main className="flex-1 p-4">
        <div className="h-[540px] rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div ref={mountRef} className="w-full h-full" />
        </div>
      </main>
    </div>
  );
}

export default App;
