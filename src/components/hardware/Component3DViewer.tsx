import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Compass, Eye, Layers, ExternalLink } from 'lucide-react';

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
  const [rotationSpeed] = useState(0.007);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.Material[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0b0e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 14, 28);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer with high-definition anti-aliasing & shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Multi-Point High-Fidelity Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Key studio light with soft shadow
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    keyLight.position.set(16, 26, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Warm rim backlight for aerospace silhouette
    const rimLight = new THREE.DirectionalLight(0xff5a36, 1.9);
    rimLight.position.set(-18, 12, -16);
    scene.add(rimLight);

    // Cool blue specular fill light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    fillLight.position.set(-12, -10, 16);
    scene.add(fillLight);

    // Ground Grid & Studio Pedestal
    const gridHelper = new THREE.GridHelper(44, 44, 0xff5a36, 0x1a1e28);
    gridHelper.position.y = -7.5;
    scene.add(gridHelper);

    // Ground Shadow Catcher
    const shadowGeo = new THREE.PlaneGeometry(36, 36);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -7.49;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Root model group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const mats: THREE.Material[] = [];
    materialsRef.current = mats;

    // Build hyper-realistic 3D geometry based on component ID
    buildComponentMesh(componentId, group, mats, wireframe);

    // Smooth Drag Orbit Controls
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

      groupRef.current.rotation.y += deltaX * 0.01;
      groupRef.current.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.025;
      cameraRef.current.position.z = Math.max(10, Math.min(55, cameraRef.current.position.z));
    };

    // Touch controls for mobile devices
    let touchStartDistance = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistance = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging && groupRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        groupRef.current.rotation.y += deltaX * 0.012;
        groupRef.current.rotation.x += deltaY * 0.012;

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && cameraRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = (touchStartDistance - dist) * 0.04;
        cameraRef.current.position.z += factor;
        cameraRef.current.position.z = Math.max(10, Math.min(55, cameraRef.current.position.z));
        touchStartDistance = dist;
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

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (groupRef.current && autoRotate && !isDragging) {
        groupRef.current.rotation.y += rotationSpeed;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
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

  // Wireframe toggle effect
  useEffect(() => {
    materialsRef.current.forEach(mat => {
      (mat as THREE.MeshStandardMaterial).wireframe = wireframe;
    });
  }, [wireframe]);

  const handleResetView = () => {
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 14, 28);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z += delta;
      cameraRef.current.position.z = Math.max(10, Math.min(55, cameraRef.current.position.z));
    }
  };

  return (
    <div className="relative w-full h-[460px] lg:h-[520px] bg-[#0A0B0E] rounded-xl overflow-hidden border border-[#202432]">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Badge */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest text-[#FF5A36] uppercase font-bold">
            REALISTIC 3D CAD MODEL
          </span>
        </div>
        <h4 className="text-white font-bold text-sm tracking-wide">{name}</h4>
        <span className="text-[10px] font-mono text-[#8E95A5]">
          DRAG TO ORBIT 360° · SCROLL TO ZOOM · TOUCH / PINCH READY
        </span>
      </div>

      {/* Top-Right Online 3D / CAD Badge */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <a
          href="https://github.com/topics/uav-hardware"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141722]/90 border border-[#2B3042] text-[11px] font-mono text-[#D8DDE8] hover:text-white hover:border-[#FF5A36] transition-colors shadow-md"
        >
          <span>Online CAD Reference</span>
          <ExternalLink className="w-3 h-3 text-[#FF5A36]" />
        </a>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#12141D]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#232738] shadow-lg">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
              autoRotate ? 'bg-[#FF5A36] text-white font-bold' : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{autoRotate ? 'ROTATING' : 'PAUSED'}</span>
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
              wireframe ? 'bg-[#38BDF8] text-[#0A0B0E] font-bold' : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>WIREFRAME</span>
          </button>
        </div>

        {/* View and Zoom Action Buttons */}
        <div className="flex items-center gap-1.5 bg-[#12141D]/90 backdrop-blur-md p-1 rounded-lg border border-[#232738] shadow-lg">
          <button
            onClick={() => handleZoom(-4)}
            title="Zoom In"
            className="p-1.5 text-[#8E95A5] hover:text-white hover:bg-[#1E2232] rounded transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(4)}
            title="Zoom Out"
            className="p-1.5 text-[#8E95A5] hover:text-white hover:bg-[#1E2232] rounded transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            title="Reset View"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-[#8E95A5] hover:text-white hover:bg-[#1E2232] rounded transition-colors cursor-pointer font-bold"
          >
            <Compass className="w-3.5 h-3.5 text-[#FF5A36]" />
            RESET
          </button>
        </div>
      </div>
    </div>
  );
};

// Builder function for hyper-realistic 3D aerospace parts
function buildComponentMesh(
  id: string,
  root: THREE.Group,
  mats: THREE.Material[],
  wireframe: boolean
) {
  // Realistic PBR Materials
  const carbonFiberMat = new THREE.MeshStandardMaterial({
    color: 0x161820,
    roughness: 0.35,
    metalness: 0.7,
    wireframe
  });
  const anodizedOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xff5a36,
    roughness: 0.22,
    metalness: 0.85,
    wireframe
  });
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.25,
    metalness: 0.9,
    wireframe
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x222530,
    roughness: 0.38,
    metalness: 0.82,
    wireframe
  });
  const silverMetalMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.18,
    metalness: 0.92,
    wireframe
  });
  const pcbGreenMat = new THREE.MeshStandardMaterial({
    color: 0x0d281e,
    roughness: 0.5,
    metalness: 0.25,
    wireframe
  });
  const goldPinMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.15,
    metalness: 0.95,
    wireframe
  });
  const lensGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.05,
    transmission: 0.9,
    thickness: 1.4,
    wireframe
  });
  const thermalGermaniumMat = new THREE.MeshPhysicalMaterial({
    color: 0xff7b00,
    roughness: 0.1,
    metalness: 0.5,
    transmission: 0.7,
    thickness: 1.2,
    wireframe
  });
  const redSiliconeMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.6,
    metalness: 0.1,
    wireframe
  });
  const yellowShrinkMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.5,
    metalness: 0.2,
    wireframe
  });

  mats.push(
    carbonFiberMat,
    anodizedOrangeMat,
    copperMat,
    darkMetalMat,
    silverMetalMat,
    pcbGreenMat,
    goldPinMat,
    lensGlassMat,
    thermalGermaniumMat,
    redSiliconeMat,
    yellowShrinkMat
  );

  if (id === 'hybrid-airframe') {
    // 3D Hybrid VTOL Quadplane Model
    // 1. Central Fuselage
    const fuselageGeo = new THREE.CylinderGeometry(1.6, 1.2, 18, 16);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, carbonFiberMat);
    fuselage.castShadow = true;
    root.add(fuselage);

    // Nose Cone
    const noseGeo = new THREE.ConeGeometry(1.6, 4, 16);
    noseGeo.rotateX(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, darkMetalMat);
    nose.position.set(0, 0, 11);
    root.add(nose);

    // Gimbal Sensor Pod in Nose
    const gimbalGeo = new THREE.SphereGeometry(1.3, 16, 16);
    const gimbal = new THREE.Mesh(gimbalGeo, anodizedOrangeMat);
    gimbal.position.set(0, -1.2, 9.5);
    root.add(gimbal);

    // 2. High-Aspect Main Wings
    const wingGeo = new THREE.BoxGeometry(32, 0.4, 4.5);
    const wing = new THREE.Mesh(wingGeo, carbonFiberMat);
    wing.position.set(0, 0.6, 0);
    wing.castShadow = true;
    root.add(wing);

    // Winglet tips
    const wingletL = new THREE.BoxGeometry(0.3, 2.2, 3);
    const tipL = new THREE.Mesh(wingletL, anodizedOrangeMat);
    tipL.position.set(-16, 1.4, 0);
    root.add(tipL);

    const tipR = new THREE.Mesh(wingletL, anodizedOrangeMat);
    tipR.position.set(16, 1.4, 0);
    root.add(tipR);

    // 3. Dual Parallel Carbon Booms
    const boomGeo = new THREE.CylinderGeometry(0.4, 0.4, 14, 12);
    boomGeo.rotateX(Math.PI / 2);
    const boomL = new THREE.Mesh(boomGeo, darkMetalMat);
    boomL.position.set(-6, -0.2, 0);
    root.add(boomL);

    const boomR = new THREE.Mesh(boomGeo, darkMetalMat);
    boomR.position.set(6, -0.2, 0);
    root.add(boomR);

    // 4. 4x VTOL Motor Pods + Propeller Discs
    const motorPodGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.4, 12);
    const propDiscGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.05, 16);
    const propMat = new THREE.MeshBasicMaterial({
      color: 0xff5a36,
      transparent: true,
      opacity: 0.35,
      wireframe
    });
    mats.push(propMat);

    const vtolCoords = [
      { x: -6, z: 6 },
      { x: -6, z: -6 },
      { x: 6, z: 6 },
      { x: 6, z: -6 }
    ];

    vtolCoords.forEach(pos => {
      const pod = new THREE.Mesh(motorPodGeo, anodizedOrangeMat);
      pod.position.set(pos.x, 0.6, pos.z);
      root.add(pod);

      const prop = new THREE.Mesh(propDiscGeo, propMat);
      prop.position.set(pos.x, 1.4, pos.z);
      root.add(prop);
    });

    // 5. Rear Cruise Pusher Motor
    const cruiseMotor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 1.8, 12),
      darkMetalMat
    );
    cruiseMotor.rotation.x = Math.PI / 2;
    cruiseMotor.position.set(0, 0, -9.5);
    root.add(cruiseMotor);

    const cruiseProp = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 5, 0.1),
      silverMetalMat
    );
    cruiseProp.position.set(0, 0, -10.5);
    root.add(cruiseProp);

    // 6. Inverted V-Tail
    const tailLGeo = new THREE.BoxGeometry(0.3, 4, 2);
    const tailLMesh = new THREE.Mesh(tailLGeo, carbonFiberMat);
    tailLMesh.rotation.z = Math.PI / 5;
    tailLMesh.position.set(-2, 1.8, -8);
    root.add(tailLMesh);

    const tailRGeo = new THREE.BoxGeometry(0.3, 4, 2);
    const tailRMesh = new THREE.Mesh(tailRGeo, carbonFiberMat);
    tailRMesh.rotation.z = -Math.PI / 5;
    tailRMesh.position.set(2, 1.8, -8);
    root.add(tailRMesh);
  } else if (id.includes('motor')) {
    // 3D Brushless Outrunner Motor
    // Stator Base
    const baseGeo = new THREE.CylinderGeometry(5.2, 5.5, 2, 24);
    const base = new THREE.Mesh(baseGeo, darkMetalMat);
    base.position.y = -3;
    base.castShadow = true;
    root.add(base);

    // Outrunner Bell with cooling cutouts
    const bellGeo = new THREE.CylinderGeometry(5.2, 5.2, 5.5, 24);
    const bell = new THREE.Mesh(bellGeo, anodizedOrangeMat);
    bell.position.y = 1;
    bell.castShadow = true;
    root.add(bell);

    // Stator Copper Windings (inside)
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const pole = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.5, 1.5), copperMat);
      pole.position.set(Math.cos(angle) * 3.8, 1, Math.sin(angle) * 3.8);
      pole.rotation.y = -angle;
      root.add(pole);
    }

    // Stainless Steel Rotor Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.6, 0.6, 12, 16);
    const shaft = new THREE.Mesh(shaftGeo, silverMetalMat);
    shaft.position.y = 3;
    root.add(shaft);

    // Propeller Hub Adapter
    const hubGeo = new THREE.CylinderGeometry(2.4, 2.8, 1.8, 16);
    const hub = new THREE.Mesh(hubGeo, darkMetalMat);
    hub.position.y = 4.2;
    root.add(hub);

    // Heavy Silicone Leads
    const wireGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 8);
    wireGeo.rotateZ(Math.PI / 3);
    const lead = new THREE.Mesh(wireGeo, redSiliconeMat);
    lead.position.set(4, -4, 0);
    root.add(lead);
  } else if (id.includes('propeller')) {
    // Aerodynamic Carbon Fiber Propeller
    const hubGeo = new THREE.CylinderGeometry(2, 2, 1.4, 16);
    const hub = new THREE.Mesh(hubGeo, darkMetalMat);
    root.add(hub);

    // Blade 1
    const blade1Geo = new THREE.BoxGeometry(16, 0.3, 1.8);
    blade1Geo.rotateY(Math.PI / 12);
    const blade1 = new THREE.Mesh(blade1Geo, carbonFiberMat);
    blade1.position.set(8, 0, 0);
    root.add(blade1);

    // Blade 2
    const blade2Geo = new THREE.BoxGeometry(16, 0.3, 1.8);
    blade2Geo.rotateY(-Math.PI / 12);
    const blade2 = new THREE.Mesh(blade2Geo, carbonFiberMat);
    blade2.position.set(-8, 0, 0);
    root.add(blade2);

    // Center lock nut
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 6), anodizedOrangeMat);
    root.add(nut);
  } else if (id.includes('esc')) {
    // Aircraft Electronic Speed Controller
    const caseGeo = new THREE.BoxGeometry(12, 3.2, 7);
    const casing = new THREE.Mesh(caseGeo, darkMetalMat);
    casing.castShadow = true;
    root.add(casing);

    // Finned Heatsink
    for (let x = -5; x <= 5; x += 1.4) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 6.6), anodizedOrangeMat);
      fin.position.set(x, 2.2, 0);
      root.add(fin);
    }

    // Filter Electrolytic Capacitors
    const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 4, 16), darkMetalMat);
    cap1.rotation.z = Math.PI / 2;
    cap1.position.set(-7, 0, 1.8);
    root.add(cap1);

    const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 4, 16), darkMetalMat);
    cap2.rotation.z = Math.PI / 2;
    cap2.position.set(-7, 0, -1.8);
    root.add(cap2);

    // Motor Leads
    for (let z = -2; z <= 2; z += 2) {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5, 8), copperMat);
      wire.rotation.z = Math.PI / 2;
      wire.position.set(8, 0, z);
      root.add(wire);
    }
  } else if (id === 'jetson') {
    // NVIDIA Jetson Orin Nano Super 8GB Developer Kit
    // PCB Carrier Board
    const pcbGeo = new THREE.BoxGeometry(16, 0.8, 14);
    const pcb = new THREE.Mesh(pcbGeo, pcbGreenMat);
    pcb.castShadow = true;
    root.add(pcb);

    // Active Aluminum Heatsink Base
    const hsBaseGeo = new THREE.BoxGeometry(10, 2.2, 9);
    const hsBase = new THREE.Mesh(hsBaseGeo, darkMetalMat);
    hsBase.position.set(0, 1.5, 0);
    root.add(hsBase);

    // Heatsink Fins
    for (let i = -4; i <= 4; i += 0.8) {
      const finGeo = new THREE.BoxGeometry(9.6, 1.8, 0.25);
      const fin = new THREE.Mesh(finGeo, silverMetalMat);
      fin.position.set(0, 3.2, i);
      root.add(fin);
    }

    // Centered PWM Cooling Fan
    const fanRim = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.35, 8, 24), darkMetalMat);
    fanRim.rotation.x = Math.PI / 2;
    fanRim.position.set(0, 3.6, 0);
    root.add(fanRim);

    const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.8, 16), anodizedOrangeMat);
    fanHub.position.set(0, 3.6, 0);
    root.add(fanHub);

    // Dual MIPI CSI Camera Connectors
    const camSlotGeo = new THREE.BoxGeometry(3.5, 0.8, 0.8);
    const cam0 = new THREE.Mesh(camSlotGeo, silverMetalMat);
    cam0.position.set(-4, 0.8, -5.5);
    root.add(cam0);
    const cam1 = new THREE.Mesh(camSlotGeo, silverMetalMat);
    cam1.position.set(2, 0.8, -5.5);
    root.add(cam1);

    // Dual USB 3.2 Stack + Ethernet
    const usbStack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3, 3.8), silverMetalMat);
    usbStack.position.set(-7, 1.8, 1);
    root.add(usbStack);

    const ethPort = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 3.4), darkMetalMat);
    ethPort.position.set(-7, 1.8, -3.5);
    root.add(ethPort);

    // 40-pin GPIO Header
    const gpio = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 9), goldPinMat);
    gpio.position.set(7, 1.2, 0);
    root.add(gpio);
  } else if (id === 'thermal-camera' || id === 'rgb-camera') {
    // 3D Camera Core
    const bodyGeo = new THREE.BoxGeometry(8, 8, 7);
    const body = new THREE.Mesh(bodyGeo, darkMetalMat);
    body.castShadow = true;
    root.add(body);

    // Lens Barrel
    const barrelGeo = new THREE.CylinderGeometry(3.2, 3.6, 4.5, 24);
    barrelGeo.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, darkMetalMat);
    barrel.position.set(0, 0, 4.5);
    root.add(barrel);

    // Gold Bezel
    const bezelGeo = new THREE.TorusGeometry(3.2, 0.35, 12, 24);
    const bezel = new THREE.Mesh(bezelGeo, goldPinMat);
    bezel.position.set(0, 0, 6.7);
    root.add(bezel);

    // Optical Aperture / Germanium Core
    const lensGeo = new THREE.SphereGeometry(2.9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    lensGeo.rotateX(Math.PI / 2);
    const lens = new THREE.Mesh(
      lensGeo,
      id === 'thermal-camera' ? thermalGermaniumMat : lensGlassMat
    );
    lens.position.set(0, 0, 6);
    root.add(lens);

    // Heat dissipation fins
    for (let y = -2.5; y <= 2.5; y += 1.6) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.3, 6), silverMetalMat);
      fin.position.set(0, y, 0);
      root.add(fin);
    }
  } else if (id === 'flight-controller') {
    // Pixhawk 6X Autopilot
    // Base Case
    const base = new THREE.Mesh(new THREE.BoxGeometry(12, 3.2, 10), darkMetalMat);
    base.castShadow = true;
    root.add(base);

    // Damping Base Plate
    const dampPlate = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 12), silverMetalMat);
    dampPlate.position.y = -1.8;
    root.add(dampPlate);

    // Silicone Damping Balls
    const dampBallGeo = new THREE.SphereGeometry(0.8, 12, 12);
    [
      [-5.5, -5.5],
      [-5.5, 5.5],
      [5.5, -5.5],
      [5.5, 5.5]
    ].forEach(([x, z]) => {
      const ball = new THREE.Mesh(dampBallGeo, anodizedOrangeMat);
      ball.position.set(x, -1.2, z);
      root.add(ball);
    });

    // Central Status LED Indicator Prism
    const ledPrism = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 0.4, 16),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    ledPrism.position.set(0, 1.8, 0);
    root.add(ledPrism);

    // Top JST-GH Port Connectors
    for (let i = -3; i <= 3; i += 2) {
      const port = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1), silverMetalMat);
      port.position.set(i, 1.8, -3.5);
      root.add(port);
    }
  } else if (id === 'battery-6s') {
    // 6S 16,000mAh Battery Block
    const pack = new THREE.Mesh(new THREE.BoxGeometry(14, 6.5, 7.5), yellowShrinkMat);
    pack.castShadow = true;
    root.add(pack);

    // 6 Cell Segment Stripes
    for (let x = -5; x <= 5; x += 2) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 6.6, 7.6), darkMetalMat);
      stripe.position.set(x, 0, 0);
      root.add(stripe);
    }

    // Heavy Cables
    const redWire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 6, 8), redSiliconeMat);
    redWire.rotation.z = Math.PI / 3;
    redWire.position.set(8, 2, 1);
    root.add(redWire);

    const blackWire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 6, 8), darkMetalMat);
    blackWire.rotation.z = Math.PI / 3;
    blackWire.position.set(8, -1, 1);
    root.add(blackWire);

    // XT90 Plug
    const xt90 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.2), yellowShrinkMat);
    xt90.position.set(11, 0.5, 1);
    root.add(xt90);
  } else if (id === 'gps-compass') {
    // Dual-Band GNSS Dome Antenna
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 12, 12), silverMetalMat);
    mast.position.y = -2;
    root.add(mast);

    const dome = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 1.8, 24), darkMetalMat);
    dome.position.y = 4;
    dome.castShadow = true;
    root.add(dome);

    const topCap = new THREE.Mesh(new THREE.SphereGeometry(4.8, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), anodizedOrangeMat);
    topCap.position.y = 4.9;
    root.add(topCap);
  } else if (id === 'airspeed-pitot') {
    // Pitot Tube Probe
    const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 16, 16), silverMetalMat);
    probe.rotation.z = Math.PI / 2;
    root.add(probe);

    // Pressure Pickups
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.5, 16), silverMetalMat);
    nose.rotation.z = -Math.PI / 2;
    nose.position.set(8.5, 0, 0);
    root.add(nose);

    // Silicone lines
    const line1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 8, 8), redSiliconeMat);
    line1.position.set(-6, -4, 0.8);
    root.add(line1);

    const line2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 8, 8), lensGlassMat);
    line2.position.set(-6, -4, -0.8);
    root.add(line2);
  } else if (id.includes('lora') || id.includes('telemetry') || id.includes('rc-receiver')) {
    // Radio / Transceiver Module
    const box = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 6), darkMetalMat);
    box.castShadow = true;
    root.add(box);

    const shield = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 4.8), silverMetalMat);
    shield.position.y = 1.3;
    root.add(shield);

    // SMA Gold Connector
    const sma = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2, 12), goldPinMat);
    sma.rotation.x = Math.PI / 2;
    sma.position.set(0, 0, 4);
    root.add(sma);

    // Whip / Dipole Antenna
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 14, 8), darkMetalMat);
    ant.position.set(0, 7, 5);
    root.add(ant);
  } else if (id === 'servos') {
    // Digital Metal Gear Servo
    const servoCase = new THREE.Mesh(new THREE.BoxGeometry(8, 6.5, 4), darkMetalMat);
    servoCase.castShadow = true;
    root.add(servoCase);

    const topGear = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.8, 16), silverMetalMat);
    topGear.position.set(2, 4, 0);
    root.add(topGear);

    // Spline Horn
    const horn = new THREE.Mesh(new THREE.BoxGeometry(7, 0.4, 1.2), anodizedOrangeMat);
    horn.position.set(2, 4.8, 0);
    root.add(horn);

    const cable = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 6), yellowShrinkMat);
    cable.position.set(-4, -2.5, 0);
    root.add(cable);
  } else {
    // Precision Aerospace Avionics Sensor Box
    const mainBox = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 7.5), darkMetalMat);
    mainBox.castShadow = true;
    root.add(mainBox);

    const topPlate = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.5, 6.8), anodizedOrangeMat);
    topPlate.position.y = 2.4;
    root.add(topPlate);

    // Gold Pin Array / Terminal Contacts
    const pins = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 1.5), goldPinMat);
    pins.position.set(0, 0, 4.2);
    root.add(pins);

    // Status LED
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    led.position.set(3, 2.7, 2);
    root.add(led);
  }
}
