import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface GalaxyParams {
  count: number;
  size: number;
  radius: number;
  branches: number;
  spin: number;
  randomness: number;
  randomnessPower: number;
  rotationSpeed: number;
  insideColor: string;
  outsideColor: string;
}

export const GalaxyWithControls = () => {
  // Three.js 渲染挂载点
  const mountRef = useRef<HTMLDivElement>(null);
  // 保存场景实例，便于后续更新
  const sceneRef = useRef<THREE.Scene | null>(null);
  // 控制面板开关
  const [showControls, setShowControls] = useState(true);

  // 星系参数（粒子数量、大小、半径、旋臂数、旋转速度等）
  const [params, setParams] = useState<GalaxyParams>({
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    rotationSpeed: 0.05,
    insideColor: "#ff6030",
    outsideColor: "#1b3984",
  });

  useEffect(() => {
    if (!mountRef.current) return;

    // 初始化场景、相机、渲染器
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(3, 3, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 轨道控制器，支持平滑阻尼与距离限制
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 20;

    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.PointsMaterial | null = null;
    let points: THREE.Points | null = null;

    const generateGalaxy = (parameters: GalaxyParams) => {
      // 如果已有点云，先释放旧资源
      if (points) {
        geometry?.dispose();
        material?.dispose();
        scene.remove(points);
      }

      // positions/ colors 两个 Float32Array 存储每个点的位置与颜色
      geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(parameters.count * 3);
      const colors = new Float32Array(parameters.count * 3);

      const colorInside = new THREE.Color(parameters.insideColor);
      const colorOutside = new THREE.Color(parameters.outsideColor);

      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle =
          ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

        const randomX =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;
        const randomY =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;
        const randomZ =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] =
          Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      // 点材质开启颜色插值与加色混合
      material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);
    };

    generateGalaxy(params);

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // 按时间累计旋转星系
      if (points) {
        points.rotation.y = elapsedTime * params.rotationSpeed;
      }

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // 监听窗口尺寸变化，更新相机与渲染器
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      // 清理事件与 Three.js 资源，避免内存泄漏
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      geometry?.dispose();
      material?.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      // 找到场景中的点云对象并替换为新几何/材质，实现参数实时更新
      const points = sceneRef.current.children.find(
        (child) => child instanceof THREE.Points
      ) as THREE.Points | undefined;

      if (points) {
        const scene = sceneRef.current;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(params.count * 3);
        const colors = new Float32Array(params.count * 3);

        const colorInside = new THREE.Color(params.insideColor);
        const colorOutside = new THREE.Color(params.outsideColor);

        for (let i = 0; i < params.count; i++) {
          const i3 = i * 3;
          const radius = Math.random() * params.radius;
          const spinAngle = radius * params.spin;
          const branchAngle =
            ((i % params.branches) / params.branches) * Math.PI * 2;

          const randomX =
            Math.pow(Math.random(), params.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            params.randomness *
            radius;
          const randomY =
            Math.pow(Math.random(), params.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            params.randomness *
            radius;
          const randomZ =
            Math.pow(Math.random(), params.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            params.randomness *
            radius;

          positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
          positions[i3 + 1] = randomY;
          positions[i3 + 2] =
            Math.sin(branchAngle + spinAngle) * radius + randomZ;

          const mixedColor = colorInside.clone();
          mixedColor.lerp(colorOutside, radius / params.radius);

          colors[i3] = mixedColor.r;
          colors[i3 + 1] = mixedColor.g;
          colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
          size: params.size,
          sizeAttenuation: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexColors: true,
        });

        points.geometry.dispose();
        (points.material as THREE.Material).dispose();
        points.geometry = geometry;
        points.material = material;
      }
    }
  }, [params]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />

      {showControls && (
        <div className="absolute top-4 right-4 bg-slate-900 bg-opacity-90 p-4 rounded-lg text-white text-sm max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">星系控制</h3>

          <div className="space-y-3">
            <div>
              <label className="block mb-1">粒子数量: {params.count}</label>
              <input
                type="range"
                min="10000"
                max="200000"
                step="1000"
                value={params.count}
                onChange={(e) =>
                  setParams({ ...params, count: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-1">
                粒子大小: {params.size.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.001"
                max="0.05"
                step="0.001"
                value={params.size}
                onChange={(e) =>
                  setParams({ ...params, size: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-1">星系半径: {params.radius}</label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={params.radius}
                onChange={(e) =>
                  setParams({ ...params, radius: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-1">旋臂数量: {params.branches}</label>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={params.branches}
                onChange={(e) =>
                  setParams({ ...params, branches: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-1">
                旋转程度: {params.spin.toFixed(2)}
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={params.spin}
                onChange={(e) =>
                  setParams({ ...params, spin: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-1">
                随机性: {params.randomness.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={params.randomness}
                onChange={(e) =>
                  setParams({ ...params, randomness: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-1">
                旋转速度: {params.rotationSpeed.toFixed(3)}
              </label>
              <input
                type="range"
                min="0"
                max="0.2"
                step="0.005"
                value={params.rotationSpeed}
                onChange={(e) =>
                  setParams({
                    ...params,
                    rotationSpeed: Number(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-1">中心颜色</label>
              <input
                type="color"
                value={params.insideColor}
                onChange={(e) =>
                  setParams({ ...params, insideColor: e.target.value })
                }
                className="w-full h-8"
              />
            </div>

            <div>
              <label className="block mb-1">外围颜色</label>
              <input
                type="color"
                value={params.outsideColor}
                onChange={(e) =>
                  setParams({ ...params, outsideColor: e.target.value })
                }
                className="w-full h-8"
              />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-4 left-4 bg-slate-900 bg-opacity-90 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
      >
        {showControls ? "隐藏" : "显示"}控制面板
      </button>
    </div>
  );
};
