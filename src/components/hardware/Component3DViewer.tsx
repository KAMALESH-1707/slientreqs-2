import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Compass, Eye, Layers, ExternalLink, Box, Sparkles, Move3d } from 'lucide-react';

interface Component3DViewerProps {
  componentId: string;
  name: string;
  category: string;
}

export const Component3DViewer: React.FC<Component3DViewerProps> = ({
  componentId,
  name,
  category
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightingMode, setLightingMode] = useState<'studio' | 'inspection'>('studio');
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.Material[]>([]);
  const pedestalRef = useRef<THREE.Group | null>(null);
  const defaultCamDistanceRef = useRef<number>(20);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    // Scene uses alpha=true so the CSS technical studio radial background shows through
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. WebGL Renderer with High Precision & Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. High-Fidelity Studio Lighting Setup (Prevents parts from hiding in dark)
    // Ambient fill light for base visibility in shadows
    const ambientLight = new THREE.AmbientLight(0xdce5f5, 1.4);
    scene.add(ambientLight);

    // Key studio softbox (warm white from top-front-right)
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 3.2);
    keyLight.position.set(18, 25, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 80;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Fill light (cool aerospace blue-slate from opposite front-left)
    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 1.8);
    fillLight.position.set(-18, 12, 16);
    scene.add(fillLight);

    // High-contrast rim backlight (aerospace orange) to create sharp edge silhouettes
    const rimLight = new THREE.DirectionalLight(0xff6b35, 2.4);
    rimLight.position.set(-16, 14, -18);
    scene.add(rimLight);

    // Secondary cool cyan rim backlight from bottom-rear
    const rimLight2 = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight2.position.set(16, -8, -16);
    scene.add(rimLight2);

    // Overhead cleanroom ceiling spotlight
    const topLight = new THREE.PointLight(0xffffff, 1.5, 60);
    topLight.position.set(0, 22, 0);
    scene.add(topLight);

    // 5. Studio Pedestal & Circular Turntable
    const pedestalGroup = new THREE.Group();
    pedestalRef.current = pedestalGroup;
    scene.add(pedestalGroup);

    // 6. Root Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    groupRef.current = modelGroup;

    const mats: THREE.Material[] = [];
    materialsRef.current = mats;

    // Build the high-detail model
    buildComponentMesh(componentId, modelGroup, mats, wireframe);

    // 7. Auto-Centering & Dynamic Smart Camera Framing
    // Compute exact bounding box so EVERY component fills the viewport perfectly
    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Center model at (0, 0, 0)
    modelGroup.position.x = -center.x;
    modelGroup.position.y = -center.y;
    modelGroup.position.z = -center.z;

    const maxDim = Math.max(size.x, size.y, size.z, 5);
    const fov = camera.fov * (Math.PI / 180);
    const fitDistance = (maxDim / 2) / Math.tan(fov / 2) * 1.45;
    defaultCamDistanceRef.current = Math.max(12, fitDistance);

    // Initial isometric camera view
    camera.position.set(
      defaultCamDistanceRef.current * 0.7,
      defaultCamDistanceRef.current * 0.45,
      defaultCamDistanceRef.current * 0.95
    );
    camera.lookAt(0, 0, 0);

    // Configure circular turntable pedestal right beneath the component
    const pedestalY = -maxDim * 0.65;
    const pedestalRadius = Math.max(maxDim * 0.85, 8);

    // Brushed metallic turntable disc
    const discGeo = new THREE.CylinderGeometry(pedestalRadius, pedestalRadius * 1.04, 0.4, 48);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x181c28,
      roughness: 0.35,
      metalness: 0.7
    });
    mats.push(discMat);
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = pedestalY;
    disc.receiveShadow = true;
    pedestalGroup.add(disc);

    // Glowing outer LED accent ring
    const ringGeo = new THREE.TorusGeometry(pedestalRadius * 1.01, 0.12, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff5a36 });
    mats.push(ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = pedestalY + 0.22;
    pedestalGroup.add(ring);

    // Soft contact shadow catcher
    const shadowGeo = new THREE.PlaneGeometry(pedestalRadius * 2.6, pedestalRadius * 2.6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.55 });
    mats.push(shadowMat);
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = pedestalY + 0.21;
    shadowPlane.receiveShadow = true;
    pedestalGroup.add(shadowPlane);

    // Azimuth degree markings around turntable
    const azimGeo = new THREE.RingGeometry(pedestalRadius * 0.75, pedestalRadius * 0.95, 36);
    azimGeo.rotateX(-Math.PI / 2);
    const azimMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    mats.push(azimMat);
    const azimRing = new THREE.Mesh(azimGeo, azimMat);
    azimRing.position.y = pedestalY + 0.22;
    pedestalGroup.add(azimRing);

    // 8. Smooth Drag Orbit & Zoom Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !groupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      groupRef.current.rotation.y += deltaX * 0.008;
      groupRef.current.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomFactor = e.deltaY * 0.02;
      cameraRef.current.position.multiplyScalar(1 + zoomFactor * 0.05);
      
      const dist = cameraRef.current.position.length();
      const minDist = defaultCamDistanceRef.current * 0.4;
      const maxDist = defaultCamDistanceRef.current * 2.8;
      if (dist < minDist) cameraRef.current.position.setLength(minDist);
      if (dist > maxDist) cameraRef.current.position.setLength(maxDist);
    };

    // Touch controls
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging && groupRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        groupRef.current.rotation.y += deltaX * 0.01;
        groupRef.current.rotation.x += deltaY * 0.01;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && cameraRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = (touchStartDist - dist) * 0.005;
        cameraRef.current.position.multiplyScalar(1 + factor);
        touchStartDist = dist;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 9. Animation Render Loop
    let animationFrameId: number;
    let time = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.015;

      if (groupRef.current && autoRotate && !isDragging) {
        groupRef.current.rotation.y += 0.006;
      }

      // Gentle pulse on glowing elements
      if (ringMat) {
        ringMat.color.setHSL(0.04, 0.95, 0.5 + Math.sin(time * 2) * 0.08);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('wheel', onWheel);
        renderer.domElement.removeEventListener('touchstart', onTouchStart);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [componentId]);

  // Wireframe toggle
  useEffect(() => {
    materialsRef.current.forEach(mat => {
      if ('wireframe' in mat) {
        (mat as THREE.MeshStandardMaterial).wireframe = wireframe;
      }
    });
  }, [wireframe]);

  // Camera Presets
  const setCameraPreset = (preset: 'iso' | 'front' | 'top' | 'side') => {
    if (!cameraRef.current || !groupRef.current) return;
    const dist = defaultCamDistanceRef.current;
    groupRef.current.rotation.set(0, 0, 0);

    switch (preset) {
      case 'iso':
        cameraRef.current.position.set(dist * 0.7, dist * 0.45, dist * 0.95);
        break;
      case 'front':
        cameraRef.current.position.set(0, 0, dist * 1.25);
        break;
      case 'top':
        cameraRef.current.position.set(0, dist * 1.35, 0.001);
        break;
      case 'side':
        cameraRef.current.position.set(dist * 1.35, 0, 0);
        break;
    }
    cameraRef.current.lookAt(0, 0, 0);
  };

  const handleZoom = (factor: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(factor);
      const dist = cameraRef.current.position.length();
      const minDist = defaultCamDistanceRef.current * 0.4;
      const maxDist = defaultCamDistanceRef.current * 2.8;
      if (dist < minDist) cameraRef.current.position.setLength(minDist);
      if (dist > maxDist) cameraRef.current.position.setLength(maxDist);
    }
  };

  return (
    <div className="relative w-full h-[480px] lg:h-[550px] rounded-2xl overflow-hidden border border-[#222838] shadow-2xl flex flex-col justify-between select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 35%, #181d2a 0%, #0e111a 60%, #08090d 100%)'
      }}
    >
      {/* Top Overlay Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between pointer-events-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_10px_#10B981]" />
            <span className="text-[11px] font-mono tracking-widest text-[#FF5A36] uppercase font-bold">
              REALISTIC 3D CAD STUDIO · {category}
            </span>
          </div>
          <h3 className="text-white text-base sm:text-lg font-bold tracking-tight drop-shadow-md">
            {name}
          </h3>
          <p className="text-[11px] font-mono text-[#94A3B8]">
            DRAG TO ORBIT 360° · SCROLL / PINCH TO ZOOM · LIGHTING ACTIVE
          </p>
        </div>

        {/* CAD Online Reference */}
        <div className="pointer-events-auto">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(name + ' 3d cad step grabcad')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141824]/90 backdrop-blur-md border border-[#2B3348] text-xs font-mono text-[#E2E8F0] hover:text-white hover:border-[#FF5A36] transition-all shadow-lg"
            title="Download or view manufacturing 3D CAD STEP models"
          >
            <span>CAD Model Online</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#FF5A36]" />
          </a>
        </div>
      </div>

      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Camera Angle Presets Bar */}
      <div className="absolute top-20 right-4 z-10 flex flex-col gap-1.5 pointer-events-auto bg-[#121622]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#232A3C] shadow-xl">
        <span className="text-[9px] font-mono font-bold text-[#8E95A5] px-1 text-center">VIEW</span>
        <button
          onClick={() => setCameraPreset('iso')}
          className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-[#1C2232] hover:bg-[#FF5A36] text-white transition-colors cursor-pointer text-left"
          title="Isometric View"
        >
          ISO 3D
        </button>
        <button
          onClick={() => setCameraPreset('front')}
          className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-[#1C2232] hover:bg-[#FF5A36] text-white transition-colors cursor-pointer text-left"
          title="Front View"
        >
          FRONT
        </button>
        <button
          onClick={() => setCameraPreset('top')}
          className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-[#1C2232] hover:bg-[#FF5A36] text-white transition-colors cursor-pointer text-left"
          title="Top Down View"
        >
          TOP
        </button>
        <button
          onClick={() => setCameraPreset('side')}
          className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-[#1C2232] hover:bg-[#FF5A36] text-white transition-colors cursor-pointer text-left"
          title="Side Profile View"
        >
          SIDE
        </button>
      </div>

      {/* Bottom Technical Controls Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-auto">
        {/* Left: Rotation & Wireframe Controls */}
        <div className="flex items-center gap-2 bg-[#121622]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#242C3E] shadow-xl">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
              autoRotate
                ? 'bg-[#FF5A36] text-white shadow-md shadow-[#FF5A36]/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1A202E]'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{autoRotate ? '360° TURNTABLE' : 'PAUSED'}</span>
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
              wireframe
                ? 'bg-[#38BDF8] text-[#0A0B0E] shadow-md shadow-[#38BDF8]/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1A202E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CAD MESH</span>
          </button>
        </div>

        {/* Right: Zoom & Reset Actions */}
        <div className="flex items-center gap-1.5 bg-[#121622]/95 backdrop-blur-md p-1 rounded-xl border border-[#242C3E] shadow-xl">
          <button
            onClick={() => handleZoom(0.85)}
            title="Zoom In"
            className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#1C2232] rounded-lg transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(1.18)}
            title="Zoom Out"
            className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#1C2232] rounded-lg transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCameraPreset('iso')}
            title="Reset to Default Angle"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-[#94A3B8] hover:text-white hover:bg-[#1C2232] rounded-lg transition-colors cursor-pointer font-bold"
          >
            <Compass className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HIGH-FIDELITY 3D COMPONENT GENERATOR (25 DEDICATED REALISTIC MODELS)
// ============================================================================
function buildComponentMesh(
  id: string,
  root: THREE.Group,
  mats: THREE.Material[],
  wireframe: boolean
) {
  // Realistic Aerospace PBR Materials
  // 1. Carbon Fiber Weave with subtle specular sheen
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x242834,
    roughness: 0.32,
    metalness: 0.5,
    wireframe
  });
  // 2. Aircraft Anodized Orange Aluminum (6061-T6)
  const anodizedOrange = new THREE.MeshStandardMaterial({
    color: 0xff5a36,
    roughness: 0.22,
    metalness: 0.82,
    wireframe
  });
  // 3. CNC Machined Aircraft Dark Alloy
  const darkAlloy = new THREE.MeshStandardMaterial({
    color: 0x2b3040,
    roughness: 0.35,
    metalness: 0.78,
    wireframe
  });
  // 4. Polished Stainless Steel / Titanium
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0xe5e9f0,
    roughness: 0.16,
    metalness: 0.94,
    wireframe
  });
  // 5. Electrolytic Copper Windings
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xdd7722,
    roughness: 0.2,
    metalness: 0.88,
    wireframe
  });
  // 6. 24K Gold Contacts & RF Pins
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf5b041,
    roughness: 0.14,
    metalness: 0.96,
    wireframe
  });
  // 7. Multi-Layer FR4 Electronics PCB
  const pcbMat = new THREE.MeshStandardMaterial({
    color: 0x0f2b20,
    roughness: 0.45,
    metalness: 0.2,
    wireframe
  });
  // 8. Optical Anti-Reflective Glass (RGB camera)
  const opticalGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0ea5e9,
    roughness: 0.05,
    transmission: 0.88,
    thickness: 1.6,
    ior: 1.52,
    wireframe
  });
  // 9. Germanium Thermal Infrared Crystal (Thermal camera)
  const germaniumLensMat = new THREE.MeshPhysicalMaterial({
    color: 0xf97316,
    roughness: 0.08,
    metalness: 0.55,
    transmission: 0.72,
    thickness: 1.4,
    wireframe
  });
  // 10. Heavy Silicone Wire (Red)
  const redSilicone = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.6,
    metalness: 0.1,
    wireframe
  });
  // 11. Heavy Silicone Wire (Black)
  const blackSilicone = new THREE.MeshStandardMaterial({
    color: 0x181a24,
    roughness: 0.55,
    metalness: 0.2,
    wireframe
  });
  // 12. Industrial LiPo Heatshrink
  const lipoShrink = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.4,
    metalness: 0.2,
    wireframe
  });
  // 13. Emissive Green LED
  const ledGreen = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  // 14. Emissive Red Beacon
  const ledRed = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  // 15. Emissive Blue LED
  const ledBlue = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  mats.push(
    carbonMat, anodizedOrange, darkAlloy, titaniumMat, copperMat,
    goldMat, pcbMat, opticalGlassMat, germaniumLensMat,
    redSilicone, blackSilicone, lipoShrink, ledGreen, ledRed, ledBlue
  );

  // Helper for adding hex screws
  const addHexScrew = (parent: THREE.Object3D, x: number, y: number, z: number, r = 0.35) => {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.2, 6), titaniumMat);
    screw.position.set(x, y, z);
    parent.add(screw);
  };

  // =========================================================================
  // MODEL 1: HYBRID VTOL FIXED-WING AIRFRAME (2.1M QUADPLANE)
  // =========================================================================
  if (id === 'hybrid-airframe') {
    // 1. Contoured Aerodynamic Fuselage
    const fuselageCurve = new THREE.CylinderGeometry(1.8, 1.1, 16, 20);
    fuselageCurve.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageCurve, carbonMat);
    fuselage.castShadow = true;
    root.add(fuselage);

    // Aerodynamic Nose Cone
    const nose = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4.5, 20), darkAlloy);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 0, 10.25);
    root.add(nose);

    // Avionics Hatch with Orange Livery Accent
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 7, 16, 1, false, 0, Math.PI), anodizedOrange);
    canopy.rotation.x = Math.PI / 2;
    canopy.rotation.z = Math.PI;
    canopy.position.set(0, 0.9, 2);
    root.add(canopy);

    // 2-Axis Sensor Gimbal Turret under nose
    const gimbalBase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.8, 16), darkAlloy);
    gimbalBase.position.set(0, -1.6, 7.5);
    root.add(gimbalBase);

    const gimbalSphere = new THREE.Mesh(new THREE.SphereGeometry(1.3, 20, 20), darkAlloy);
    gimbalSphere.position.set(0, -2.5, 7.5);
    root.add(gimbalSphere);

    // Dual Optical Windows on Turret (RGB & Thermal)
    const rgbEye = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 16), opticalGlassMat);
    rgbEye.rotation.x = Math.PI / 2;
    rgbEye.position.set(-0.5, -2.5, 8.7);
    root.add(rgbEye);

    const thermalEye = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16), germaniumLensMat);
    thermalEye.rotation.x = Math.PI / 2;
    thermalEye.position.set(0.5, -2.5, 8.7);
    root.add(thermalEye);

    // 2. High-Aspect Ratio Wings (2.1m wingspan representation)
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(15, 0.35, 4.2), carbonMat);
    wingL.position.set(-8.5, 0.6, -0.5);
    wingL.castShadow = true;
    root.add(wingL);

    const wingR = new THREE.Mesh(new THREE.BoxGeometry(15, 0.35, 4.2), carbonMat);
    wingR.position.set(8.5, 0.6, -0.5);
    wingR.castShadow = true;
    root.add(wingR);

    // Winglets with Navigation Lights (Red Port / Green Starboard)
    const wingletL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.4, 2.8), anodizedOrange);
    wingletL.position.set(-16, 1.6, -0.5);
    root.add(wingletL);
    const navLightL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), ledRed);
    navLightL.position.set(-16, 2.6, -0.5);
    root.add(navLightL);

    const wingletR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.4, 2.8), anodizedOrange);
    wingletR.position.set(16, 1.6, -0.5);
    root.add(wingletR);
    const navLightR = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), ledGreen);
    navLightR.position.set(16, 2.6, -0.5);
    root.add(navLightR);

    // 3. Dual Rigid Carbon-Fiber VTOL Booms
    const boomGeo = new THREE.CylinderGeometry(0.42, 0.42, 16, 16);
    boomGeo.rotateX(Math.PI / 2);
    const boomL = new THREE.Mesh(boomGeo, darkAlloy);
    boomL.position.set(-6, -0.1, -0.5);
    root.add(boomL);

    const boomR = new THREE.Mesh(boomGeo, darkAlloy);
    boomR.position.set(6, -0.1, -0.5);
    root.add(boomR);

    // 4. 4x VTOL Motor Mounts & Carbon Folding Propellers
    const vtolPoints = [
      { x: -6, z: 6.5 }, { x: -6, z: -7.5 },
      { x: 6, z: 6.5 }, { x: 6, z: -7.5 }
    ];
    vtolPoints.forEach(p => {
      const motorMount = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.3, 16), anodizedOrange);
      motorMount.position.set(p.x, 0.7, p.z);
      root.add(motorMount);

      // Spinning Propeller Disc
      const propDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(3.6, 3.6, 0.04, 24),
        new THREE.MeshBasicMaterial({ color: 0xff5a36, transparent: true, opacity: 0.35, wireframe })
      );
      mats.push(propDisc.material as THREE.Material);
      propDisc.position.set(p.x, 1.45, p.z);
      root.add(propDisc);
    });

    // 5. Inverted V-Tail Empennage
    const vTailL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.5, 2.4), carbonMat);
    vTailL.rotation.z = Math.PI / 5;
    vTailL.position.set(-2.2, 1.9, -8.2);
    root.add(vTailL);

    const vTailR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.5, 2.4), carbonMat);
    vTailR.rotation.z = -Math.PI / 5;
    vTailR.position.set(2.2, 1.9, -8.2);
    root.add(vTailR);

    // 6. Rear Pusher Cruise Motor
    const pusher = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.95, 1.8, 16), darkAlloy);
    pusher.rotation.x = Math.PI / 2;
    pusher.position.set(0, 0, -8.9);
    root.add(pusher);

    const pusherProp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.5, 0.12), titaniumMat);
    pusherProp.position.set(0, 0, -9.9);
    root.add(pusherProp);

    // Top GNSS Antenna Puck
    const gpsPuck = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 16), darkAlloy);
    gpsPuck.position.set(0, 2.2, -1.5);
    root.add(gpsPuck);
  }

  // =========================================================================
  // MODEL 2 & 5: VTOL / CRUISE BRUSHLESS MOTORS
  // =========================================================================
  else if (id === 'vtol-motor' || id === 'cruise-motor') {
    // Heavy Stator Base with 4-Arm Mount Bracket
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.2, 1.6, 24), darkAlloy);
    base.position.y = -2.8;
    base.castShadow = true;
    root.add(base);

    // 4-Hole CNC Motor Mounting Cross
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 1.8), darkAlloy);
      arm.position.set(Math.cos(angle) * 4.8, -3.2, Math.sin(angle) * 4.8);
      arm.rotation.y = -angle;
      root.add(arm);
      addHexScrew(root, Math.cos(angle) * 5.2, -2.8, Math.sin(angle) * 5.2);
    }

    // Outer Anodized Rotor Bell with 12 Turbine Cooling Vents
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.0, 5.2, 32), anodizedOrange);
    bell.position.y = 0.8;
    bell.castShadow = true;
    root.add(bell);

    // Machined Top Vent Cutouts
    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 5.0, 1.2, 24), darkAlloy);
    topCap.position.y = 3.6;
    root.add(topCap);

    // 12 Exposed Copper Stator Windings (Internal Visible)
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const coil = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.2, 1.4), copperMat);
      coil.position.set(Math.cos(angle) * 3.6, 0.8, Math.sin(angle) * 3.6);
      coil.rotation.y = -angle;
      root.add(coil);
    }

    // Hollow 6mm Ground Steel Rotor Shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 10, 20), titaniumMat);
    shaft.position.y = 4.2;
    root.add(shaft);

    // CNC Prop Adapter with Lock Nut
    const propHub = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 2, 16), darkAlloy);
    propHub.position.y = 5.2;
    root.add(propHub);

    const lockNut = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 1.4, 6), anodizedOrange);
    lockNut.position.y = 6.6;
    root.add(lockNut);

    // 3x Heavy Silicone Motor Leads with Gold 3.5mm Bullet Connectors
    [-1.2, 0, 1.2].forEach((offset, idx) => {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5, 12), idx === 0 ? redSilicone : blackSilicone);
      wire.rotation.z = Math.PI / 2.5;
      wire.position.set(4.2, -3.2, offset);
      root.add(wire);

      const bullet = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.4, 12), goldMat);
      bullet.rotation.z = Math.PI / 2.5;
      bullet.position.set(6.6, -4.2, offset);
      root.add(bullet);
    });
  }

  // =========================================================================
  // MODEL 3 & 6: VTOL / CRUISE ELECTRONIC SPEED CONTROLLERS (ESC)
  // =========================================================================
  else if (id === 'vtol-esc' || id === 'cruise-esc') {
    // CNC Aluminum Heatsink Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(12, 3.2, 6.8), darkAlloy);
    body.castShadow = true;
    root.add(body);

    // Deep Micro-Fins for High-Amp Thermal Dissipation
    for (let x = -4.8; x <= 4.8; x += 1.2) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.6, 6.4), anodizedOrange);
      fin.position.set(x, 2.2, 0);
      root.add(fin);
    }

    // Dual High-Frequency Low-ESR Filter Capacitors
    [-1.8, 1.8].forEach(z => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 4.4, 20), darkAlloy);
      cap.rotation.z = Math.PI / 2;
      cap.position.set(-7.2, 0, z);
      root.add(cap);

      // Aluminum Cap Top
      const capTop = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.2, 16), titaniumMat);
      capTop.rotation.z = Math.PI / 2;
      capTop.position.set(-9.4, 0, z);
      root.add(capTop);
    });

    // 3-Phase High-Current Motor Output Wires
    [-2, 0, 2].forEach(z => {
      const motorWire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 5, 10), darkAlloy);
      motorWire.rotation.z = Math.PI / 2;
      motorWire.position.set(8.2, 0, z);
      root.add(motorWire);

      const goldTab = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.2, 10), goldMat);
      goldTab.rotation.z = Math.PI / 2;
      goldTab.position.set(10.8, 0, z);
      root.add(goldTab);
    });

    // Main DC Battery Leads (12AWG Red & Black)
    const redWire = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 6, 12), redSilicone);
    redWire.rotation.z = -Math.PI / 2.6;
    redWire.position.set(-8.5, -2.2, 1.4);
    root.add(redWire);

    const blkWire = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 6, 12), blackSilicone);
    blkWire.rotation.z = -Math.PI / 2.6;
    blkWire.position.set(-8.5, -2.2, -1.4);
    root.add(blkWire);
  }

  // =========================================================================
  // MODEL 4 & 7: HIGH-EFFICIENCY CARBON PROPELLERS
  // =========================================================================
  else if (id === 'vtol-propeller' || id === 'cruise-propeller') {
    // CNC Anodized Clamping Hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 1.6, 24), anodizedOrange);
    hub.castShadow = true;
    root.add(hub);

    const centerNut = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.2, 6), darkAlloy);
    root.add(centerNut);

    // Blade 1 with Aerodynamic Twist
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(16, 0.28, 2.2), carbonMat);
    blade1.rotation.y = Math.PI / 10;
    blade1.position.set(9.2, 0, 0);
    blade1.castShadow = true;
    root.add(blade1);

    // Hi-Viz Fluorescent Orange Rescue Tip
    const tip1 = new THREE.Mesh(new THREE.BoxGeometry(3, 0.32, 2.25), anodizedOrange);
    tip1.rotation.y = Math.PI / 10;
    tip1.position.set(16.5, 0, 0);
    root.add(tip1);

    // Blade 2
    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(16, 0.28, 2.2), carbonMat);
    blade2.rotation.y = -Math.PI / 10;
    blade2.position.set(-9.2, 0, 0);
    blade2.castShadow = true;
    root.add(blade2);

    const tip2 = new THREE.Mesh(new THREE.BoxGeometry(3, 0.32, 2.25), anodizedOrange);
    tip2.rotation.y = -Math.PI / 10;
    tip2.position.set(-16.5, 0, 0);
    root.add(tip2);

    // Pivot Shoulder Bolts
    addHexScrew(root, 2.4, 0.9, 0);
    addHexScrew(root, -2.4, 0.9, 0);
  }

  // =========================================================================
  // MODEL 8: PIXHAWK 6X FLIGHT CONTROLLER AUTOPILOT
  // =========================================================================
  else if (id === 'flight-controller') {
    // Machined Aircraft Aluminum Autopilot Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(13, 3.4, 10.5), darkAlloy);
    body.castShadow = true;
    root.add(body);

    // Beveled Top Cover Plate
    const topPlate = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.6, 9.8), anodizedOrange);
    topPlate.position.y = 1.9;
    root.add(topPlate);

    // Vibration-Damping Base Plate
    const dampPlate = new THREE.Mesh(new THREE.BoxGeometry(15, 0.8, 12), darkAlloy);
    dampPlate.position.y = -2.2;
    root.add(dampPlate);

    // 4x Silicone Anti-Vibration Isolator Balls
    [
      [-5.8, -5], [-5.8, 5], [5.8, -5], [5.8, 5]
    ].forEach(([x, z]) => {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), anodizedOrange);
      ball.position.set(x, -1.6, z);
      root.add(ball);
      addHexScrew(root, x, -2.6, z, 0.4);
    });

    // Central Frosted Acrylic Multi-Color Status LED Prism
    const ledPrism = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.4, 24), ledGreen);
    ledPrism.position.set(0, 2.3, 0);
    root.add(ledPrism);

    // Arrays of JST-GH Locking Connectors with Gold Pins
    for (let x = -4.5; x <= 4.5; x += 1.8) {
      const portTop = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 1.1), titaniumMat);
      portTop.position.set(x, 2.1, -4.2);
      root.add(portTop);

      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.3), goldMat);
      pin.position.set(x, 2.3, -4.2);
      root.add(pin);
    }

    // USB-C Maintenance Port
    const usbc = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 0.8), titaniumMat);
    usbc.position.set(6.6, 0.4, 0);
    root.add(usbc);
  }

  // =========================================================================
  // MODEL 9: GPS-COMPASS (HERE3 / DUAL-BAND GNSS DOME)
  // =========================================================================
  else if (id === 'gps-compass') {
    // Carbon-Fiber Antenna Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 12, 16), carbonMat);
    mast.position.y = -2;
    root.add(mast);

    // Aluminum Folding Mount Base
    const mountBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 1.4, 16), darkAlloy);
    mountBase.position.y = -7.8;
    root.add(mountBase);

    // Aerodynamic Antenna Disc Dome
    const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 1.6, 32), darkAlloy);
    domeBase.position.y = 4.2;
    domeBase.castShadow = true;
    root.add(domeBase);

    // Orange Status Ring
    const statusRing = new THREE.Mesh(new THREE.TorusGeometry(5.0, 0.22, 16, 48), anodizedOrange);
    statusRing.rotation.x = Math.PI / 2;
    statusRing.position.y = 4.8;
    root.add(statusRing);

    // Hemispherical High-Gain Radome Cap
    const domeCap = new THREE.Mesh(
      new THREE.SphereGeometry(4.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      darkAlloy
    );
    domeCap.position.y = 5.0;
    root.add(domeCap);

    // Top GNSS Compass Center Indicator
    const indicator = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16), ledGreen);
    indicator.position.y = 7.5;
    root.add(indicator);
  }

  // =========================================================================
  // MODEL 10: AIRSPEED PITOT-STATIC PROBE
  // =========================================================================
  else if (id === 'airspeed-pitot') {
    // Polished Stainless Steel Probe Tube
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 18, 20), titaniumMat);
    tube.rotation.z = Math.PI / 2;
    tube.castShadow = true;
    root.add(tube);

    // Total Pressure Aerodynamic Nose Tip
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.6, 20), titaniumMat);
    tip.rotation.z = -Math.PI / 2;
    tip.position.set(9.8, 0, 0);
    root.add(tip);

    // 4x Radial Static Holes
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 1.2, 16), anodizedOrange);
    collar.rotation.z = Math.PI / 2;
    collar.position.set(7.5, 0, 0);
    root.add(collar);

    // Wing Teardrop Aerodynamic Fairing Mount
    const fairing = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 2), darkAlloy);
    fairing.position.set(-2, -1.8, 0);
    root.add(fairing);

    // Dual Silicone Pressure Lines (Dynamic & Static)
    const line1 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 8, 10), redSilicone);
    line1.position.set(-6, -4, 0.8);
    root.add(line1);

    const line2 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 8, 10), opticalGlassMat);
    line2.position.set(-6, -4, -0.8);
    root.add(line2);
  }

  // =========================================================================
  // MODEL 11: PRECISION BAROMETER SENSOR (MS5611)
  // =========================================================================
  else if (id === 'barometer') {
    // Precision FR4 Sensor Breakout Board
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(9, 0.8, 7), pcbMat);
    pcb.castShadow = true;
    root.add(pcb);

    // Metal Can Pressure Transducer with Micropore
    const metalCan = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 1.4, 24), titaniumMat);
    metalCan.position.set(0, 1.1, 0);
    root.add(metalCan);

    const orifice = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), darkAlloy);
    orifice.position.set(0, 1.85, 0);
    root.add(orifice);

    // Gold Pin Header
    const pins = new THREE.Mesh(new THREE.BoxGeometry(6, 1.8, 1.2), goldMat);
    pins.position.set(0, 0.8, -2.8);
    root.add(pins);

    // SMD Ceramic Capacitors
    [-2.2, 2.2].forEach(x => {
      const smd = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.5), anodizedOrange);
      smd.position.set(x, 0.65, 1.8);
      root.add(smd);
    });
  }

  // =========================================================================
  // MODEL 12: DIGITAL TITANIUM GEAR SERVOS
  // =========================================================================
  else if (id === 'servos') {
    // High-Torque Servo Center Heatsink Case (Anodized Orange)
    const midCase = new THREE.Mesh(new THREE.BoxGeometry(8, 4.4, 4.4), anodizedOrange);
    midCase.castShadow = true;
    root.add(midCase);

    // Top & Bottom Reinforced Composite Covers
    const topCover = new THREE.Mesh(new THREE.BoxGeometry(8.2, 2.2, 4.6), darkAlloy);
    topCover.position.y = 3.2;
    root.add(topCover);

    const botCover = new THREE.Mesh(new THREE.BoxGeometry(8.2, 2.2, 4.6), darkAlloy);
    botCover.position.y = -3.2;
    root.add(botCover);

    // 25T Metal Spline Output Shaft
    const spline = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.8, 24), titaniumMat);
    spline.position.set(2.4, 4.8, 0);
    root.add(spline);

    // CNC Aluminum Dual-Arm Servo Horn
    const horn = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.5, 1.6), anodizedOrange);
    horn.position.set(2.4, 5.8, 0);
    root.add(horn);

    // Pushrod Linkage Ball Links
    const ballL = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), titaniumMat);
    ballL.position.set(6, 6.2, 0);
    root.add(ballL);

    const ballR = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), titaniumMat);
    ballR.position.set(-1.2, 6.2, 0);
    root.add(ballR);

    // 4x Hex Assembly Screws
    addHexScrew(root, -3.4, 4.3, 1.8);
    addHexScrew(root, -3.4, 4.3, -1.8);
    addHexScrew(root, 3.4, 4.3, 1.8);
    addHexScrew(root, 3.4, 4.3, -1.8);
  }

  // =========================================================================
  // MODEL 13 & 14 & 24: RC-RECEIVER / TELEMETRY / LORA MODULE
  // =========================================================================
  else if (id === 'rc-receiver' || id === 'telemetry-radio' || id === 'lora-module') {
    // Shielded CNC Aluminum Avionics RF Enclosure
    const box = new THREE.Mesh(new THREE.BoxGeometry(11, 3.2, 7.5), darkAlloy);
    box.castShadow = true;
    root.add(box);

    // Perforated RF Shielding Lid
    const lid = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.6, 6.4), titaniumMat);
    lid.position.y = 1.85;
    root.add(lid);

    // Gold SMA Antenna Connector
    const sma = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.8, 16), goldMat);
    sma.rotation.x = Math.PI / 2;
    sma.position.set(0, 0, 4.8);
    root.add(sma);

    // Long-Range Whip / Dipole Antenna
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 16, 12), darkAlloy);
    ant.position.set(0, 8.4, 6.2);
    root.add(ant);

    // Crossfire T-Antenna Bars if RC Receiver
    if (id === 'rc-receiver') {
      const tBar = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 0.4), anodizedOrange);
      tBar.position.set(0, 16, 6.2);
      root.add(tBar);
    }

    // Status RX / TX Communication LEDs
    const led1 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), ledGreen);
    led1.position.set(-3.6, 2.2, 2.4);
    root.add(led1);

    const led2 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), ledBlue);
    led2.position.set(-2.4, 2.2, 2.4);
    root.add(led2);
  }

  // =========================================================================
  // MODEL 15: MAUCH POWER MODULE / SENSOR
  // =========================================================================
  else if (id === 'power-module') {
    // 4-Layer Heavy Copper Sensing PCB
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(11, 1.2, 7.2), pcbMat);
    pcb.castShadow = true;
    root.add(pcb);

    // Hall-Effect Toroidal Current Sensor
    const toroid = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.8, 16, 24), darkAlloy);
    toroid.rotation.x = Math.PI / 2;
    toroid.position.y = 1.4;
    root.add(toroid);

    // Heavy Tinned Copper Busbar
    const busbar = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.5, 1.8), copperMat);
    busbar.position.y = 1.4;
    root.add(busbar);

    // Input & Output Yellow XT90 Connectors
    const xtIn = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2, 1.8), anodizedOrange);
    xtIn.position.set(-6.8, 0.8, 0);
    root.add(xtIn);

    const xtOut = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2, 1.8), anodizedOrange);
    xtOut.position.set(6.8, 0.8, 0);
    root.add(xtOut);

    // 6-Pin Shielded Telemetry Harness
    const telPort = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 1.4), titaniumMat);
    telPort.position.set(0, 1.2, -2.8);
    root.add(telPort);
  }

  // =========================================================================
  // MODEL 16: POWER DISTRIBUTION BOARD (PDB)
  // =========================================================================
  else if (id === 'power-distribution') {
    // Octagonal Heavy-Duty Multi-Layer FR4 PDB
    const pdb = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 1.2, 8), darkAlloy);
    pdb.castShadow = true;
    root.add(pdb);

    // Exposed Gold ESC Solder Pads (8 pads for quad VTOL + Cruise + BECs)
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const padPos = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.4, 12), goldMat);
      padPos.position.set(Math.cos(angle) * 5.6, 0.8, Math.sin(angle) * 5.6);
      root.add(padPos);

      const padGnd = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.4, 12), titaniumMat);
      padGnd.position.set(Math.cos(angle) * 4.2, 0.8, Math.sin(angle) * 4.2);
      root.add(padGnd);
    }

    // Large Center Main Battery Terminals
    const batInPos = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.6, 16), redSilicone);
    batInPos.position.set(-1.6, 0.9, 0);
    root.add(batInPos);

    const batInGnd = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.6, 16), blackSilicone);
    batInGnd.position.set(1.6, 0.9, 0);
    root.add(batInGnd);

    // TVS Transient Surge Diode
    const tvs = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 1.6), darkAlloy);
    tvs.position.set(0, 1.1, -1.8);
    root.add(tvs);
  }

  // =========================================================================
  // MODEL 17: 6S 16,000MAH FLIGHT BATTERY PACK
  // =========================================================================
  else if (id === 'battery-6s') {
    // Industrial Protective Shrink Battery Block
    const pack = new THREE.Mesh(new THREE.BoxGeometry(16, 7.2, 8.4), lipoShrink);
    pack.castShadow = true;
    root.add(pack);

    // Top & Bottom Carbon-Fiber Impact Armor Plates
    const plateTop = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.4, 8.6), carbonMat);
    plateTop.position.y = 3.8;
    root.add(plateTop);

    const plateBot = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.4, 8.6), carbonMat);
    plateBot.position.y = -3.8;
    root.add(plateBot);

    // 6 Cell Segment Division Bands
    for (let x = -5; x <= 5; x += 2.2) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.18, 7.3, 8.5), darkAlloy);
      band.position.set(x, 0, 0);
      root.add(band);
    }

    // Heavy 8AWG Silicone Battery Leads
    const posLead = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 7, 12), redSilicone);
    posLead.rotation.z = Math.PI / 3;
    posLead.position.set(9.5, 2.2, 1.8);
    root.add(posLead);

    const negLead = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 7, 12), blackSilicone);
    negLead.rotation.z = Math.PI / 3;
    negLead.position.set(9.5, -1.2, 1.8);
    root.add(negLead);

    // Anti-Spark Yellow XT90-S Connector
    const xt90 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.4, 2.0), anodizedOrange);
    xt90.position.set(13.2, 0.5, 1.8);
    root.add(xt90);

    // 7-Pin JST-XH Balance Connector with Multi-Color Ribbon
    const balPlug = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 3.2), titaniumMat);
    balPlug.position.set(9.2, 0, -2.8);
    root.add(balPlug);
  }

  // =========================================================================
  // MODEL 18: DC-DC STEP DOWN BEC REGULATOR
  // =========================================================================
  else if (id === 'dc-dc-bec') {
    // Shielded Aluminum Enclosure with Cooling Ribs
    const becBody = new THREE.Mesh(new THREE.BoxGeometry(10, 3.4, 6.2), darkAlloy);
    becBody.castShadow = true;
    root.add(becBody);

    // Top Heatsink Ribs
    for (let x = -3.6; x <= 3.6; x += 1.4) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 5.8), anodizedOrange);
      rib.position.set(x, 2.2, 0);
      root.add(rib);
    }

    // High-Current Toroidal Inductor Coil with Enameled Copper
    const coil = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.65, 16, 24), copperMat);
    coil.position.set(-2.2, 0.6, 0);
    root.add(coil);

    // Solid Polymer Filtering Capacitors
    const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 3.2, 16), titaniumMat);
    cap1.position.set(2.8, 0.4, 1.4);
    root.add(cap1);

    const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 3.2, 16), titaniumMat);
    cap2.position.set(2.8, 0.4, -1.4);
    root.add(cap2);
  }

  // =========================================================================
  // MODEL 19: AVIONICS WIRING HARNESS & SAFETY SWITCH
  // =========================================================================
  else if (id === 'wiring-safety') {
    // Aviation Heavy-Duty Safety Arming Button Unit
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.0, 3.2, 24), darkAlloy);
    base.castShadow = true;
    root.add(base);

    // Orange Anodized Bezel Ring
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.35, 16, 32), anodizedOrange);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.y = 1.6;
    root.add(bezel);

    // Big Glowing Red Safety Arm Button
    const button = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.2, 24), ledRed);
    button.position.y = 2.0;
    root.add(button);

    // High-Flex Braided Expandable Wire Loom Routing
    const loom1 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 8, 16), carbonMat);
    loom1.rotation.z = Math.PI / 2.2;
    loom1.position.set(-4.5, -2.4, 0);
    root.add(loom1);

    const loom2 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 8, 16), carbonMat);
    loom2.rotation.z = -Math.PI / 2.2;
    loom2.position.set(4.5, -2.4, 0);
    root.add(loom2);
  }

  // =========================================================================
  // MODEL 20: NVIDIA JETSON ORIN NANO AI SUPERCOMPUTER
  // =========================================================================
  else if (id === 'jetson') {
    // Multi-Layer Carrier Board PCB
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(17, 0.8, 14), pcbMat);
    pcb.castShadow = true;
    root.add(pcb);

    // Active Aluminum Heatsink Block
    const heatsink = new THREE.Mesh(new THREE.BoxGeometry(11, 2.4, 9.5), darkAlloy);
    heatsink.position.set(0, 1.6, 0);
    root.add(heatsink);

    // CNC Cooling Fins
    for (let z = -4; z <= 4; z += 0.9) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(10.6, 1.8, 0.28), titaniumMat);
      fin.position.set(0, 3.4, z);
      root.add(fin);
    }

    // Centered PWM Cooling Fan Cowl & Blades
    const fanRing = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.35, 12, 32), darkAlloy);
    fanRing.rotation.x = Math.PI / 2;
    fanRing.position.set(0, 3.8, 0);
    root.add(fanRing);

    const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.8, 16), anodizedOrange);
    fanHub.position.set(0, 3.8, 0);
    root.add(fanHub);

    // 7 Fan Blades
    for (let i = 0; i < 7; i++) {
      const angle = (i * Math.PI * 2) / 7;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 0.8), darkAlloy);
      blade.position.set(Math.cos(angle) * 2.2, 3.8, Math.sin(angle) * 2.2);
      blade.rotation.y = -angle;
      root.add(blade);
    }

    // Dual MIPI CSI-2 Camera Ribbon Connectors
    const camSlot1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 0.9), titaniumMat);
    camSlot1.position.set(-4.2, 0.8, -5.6);
    root.add(camSlot1);
    const camSlot2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 0.9), titaniumMat);
    camSlot2.position.set(2.2, 0.8, -5.6);
    root.add(camSlot2);

    // 4x USB 3.2 Stack + Gigabit Ethernet Port
    const usbBlock = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2, 4.4), titaniumMat);
    usbBlock.position.set(-7.5, 2.0, 1.2);
    root.add(usbBlock);

    const ethPort = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 3.6), darkAlloy);
    ethPort.position.set(-7.5, 1.9, -3.6);
    root.add(ethPort);

    // 40-Pin GPIO Expansion Header with Gold Pins
    const gpio = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 9.8), goldMat);
    gpio.position.set(7.4, 1.3, 0);
    root.add(gpio);
  }

  // =========================================================================
  // MODEL 21: SONY 4K OPTICAL RGB SURVIVOR CAMERA
  // =========================================================================
  else if (id === 'rgb-camera') {
    // Rugged Aircraft Cube Housing
    const body = new THREE.Mesh(new THREE.BoxGeometry(8.4, 8.4, 7.5), darkAlloy);
    body.castShadow = true;
    root.add(body);

    // Multi-Element Optical Lens Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.8, 4.8, 32), darkAlloy);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0, 5.2);
    root.add(barrel);

    // Gold Knurled Aperture Ring
    const goldRing = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.35, 16, 32), goldMat);
    goldRing.position.set(0, 0, 7.4);
    root.add(goldRing);

    // Curved Anti-Reflective Optical Glass Element
    const lens = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      opticalGlassMat
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0, 6.8);
    root.add(lens);

    // Peripheral Cooling Ribs
    for (let y = -2.8; y <= 2.8; y += 1.8) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.35, 6.4), anodizedOrange);
      rib.position.set(0, y, 0);
      root.add(rib);
    }
  }

  // =========================================================================
  // MODEL 22: FLIR LONG-WAVE INFRARED (LWIR) THERMAL CAMERA
  // =========================================================================
  else if (id === 'thermal-camera') {
    // Magnesium Alloy Thermal Core Housing
    const body = new THREE.Mesh(new THREE.BoxGeometry(8.2, 8.2, 7.2), darkAlloy);
    body.castShadow = true;
    root.add(body);

    // Heavy Metal Bezel
    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.0, 3.6, 32), darkAlloy);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.set(0, 0, 4.8);
    root.add(bezel);

    // Orange Anodized Protective Hood Ring
    const hood = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.38, 16, 32), anodizedOrange);
    hood.position.set(0, 0, 6.6);
    root.add(hood);

    // Characteristic Germanium (Ge) Metallic Amber IR Lens
    const germanLens = new THREE.Mesh(
      new THREE.SphereGeometry(3.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      germaniumLensMat
    );
    germanLens.rotation.x = Math.PI / 2;
    germanLens.position.set(0, 0, 6.0);
    root.add(germanLens);

    // Solenoid Calibration Shutter Tab
    const shutter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 0.8), goldMat);
    shutter.position.set(3.4, 3.4, 2.5);
    root.add(shutter);
  }

  // =========================================================================
  // MODEL 23: HIGH-ENDURANCE M.2 NVME MISSION STORAGE
  // =========================================================================
  else if (id === 'onboard-storage') {
    // M.2 2280 PCB Stick
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 5), darkAlloy);
    pcb.castShadow = true;
    root.add(pcb);

    // Gold PCIe M-Key Edge Connector Fingers
    const edge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 4.6), goldMat);
    edge.position.set(-6.8, 0, 0);
    root.add(edge);

    // Aluminum Passive Heatsink with Deep Heat Channels
    const heatsink = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.4, 4.6), anodizedOrange);
    heatsink.position.set(0.6, 1.0, 0);
    root.add(heatsink);

    for (let x = -3.8; x <= 4.2; x += 1.6) {
      const channel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 4.4), darkAlloy);
      channel.position.set(x, 1.8, 0);
      root.add(channel);
    }

    // MicroSD Emergency Redundancy Slot
    const sdSlot = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 3.4), titaniumMat);
    sdSlot.position.set(4.6, 0.55, 0);
    root.add(sdSlot);
  }

  // =========================================================================
  // MODEL 25: TACTICAL SEARCH & RESCUE GROUND STATION GATEWAY
  // =========================================================================
  else if (id === 'ground-lora-gateway') {
    // Heavy IP67 Pelican-Style Field Case
    const caseBody = new THREE.Mesh(new THREE.BoxGeometry(16, 5.2, 11), darkAlloy);
    caseBody.castShadow = true;
    root.add(caseBody);

    // Heavy Orange Corner Impact Bumpers
    [
      [-7.6, 2.2, -5.1], [-7.6, 2.2, 5.1], [7.6, 2.2, -5.1], [7.6, 2.2, 5.1],
      [-7.6, -2.2, -5.1], [-7.6, -2.2, 5.1], [7.6, -2.2, -5.1], [7.6, -2.2, 5.1]
    ].forEach(([x, y, z]) => {
      const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), anodizedOrange);
      bumper.position.set(x, y, z);
      root.add(bumper);
    });

    // Dual High-Gain Fiberglass Omnidirectional Antennas
    const antL = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 18, 16), darkAlloy);
    antL.position.set(-6, 9.8, -4.5);
    root.add(antL);

    const antR = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 18, 16), darkAlloy);
    antR.position.set(6, 9.8, -4.5);
    root.add(antR);

    // Illuminated OLED Field Telemetry Display Screen
    const screen = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.2, 4.2), ledBlue);
    screen.position.set(0, 2.7, 1);
    root.add(screen);

    // Sealed Heavy-Duty Power Toggle Switch
    const switchBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.8, 16), titaniumMat);
    switchBase.position.set(5.5, 2.8, 2.5);
    root.add(switchBase);

    const switchLever = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.6, 12), ledRed);
    switchLever.position.set(5.5, 3.8, 2.5);
    root.add(switchLever);
  }

  // =========================================================================
  // FALLBACK: PRECISION AEROSPACE AVIONICS SENSOR ENCLOSURE
  // =========================================================================
  else {
    const mainBox = new THREE.Mesh(new THREE.BoxGeometry(11, 4.2, 8), darkAlloy);
    mainBox.castShadow = true;
    root.add(mainBox);

    const topLid = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.6, 7.2), anodizedOrange);
    topLid.position.y = 2.4;
    root.add(topLid);

    const goldTerminals = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 1.6), goldMat);
    goldTerminals.position.set(0, 0, 4.4);
    root.add(goldTerminals);

    const activeLed = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), ledGreen);
    activeLed.position.set(3.6, 2.7, 2.2);
    root.add(activeLed);
  }
}
