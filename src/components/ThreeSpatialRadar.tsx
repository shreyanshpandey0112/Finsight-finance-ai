import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { formatINR } from '../utils/calculations';

interface ThreeSpatialRadarProps {
  monthlyIncome: number;
  monthlyExpense: number;
  currencySymbol: string;
  totalGoals?: number;
  savingsRate?: number;
}

export const ThreeSpatialRadar: React.FC<ThreeSpatialRadarProps> = ({
  monthlyIncome,
  monthlyExpense,
  currencySymbol,
  totalGoals = 3,
  savingsRate = 35,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeVisualMode, setActiveVisualMode] = useState<'constellation' | 'torus' | 'nebula'>('constellation');
  const [fps, setFps] = useState(60);
  const [nodeCount, setNodeCount] = useState(128);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 18;
    camera.position.y = 4;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group to hold all 3D financial models
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // 1. Central Core Sphere (Obsidian & Emerald Wireframe)
    const coreGeometry = new THREE.IcosahedronGeometry(4.5, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    universeGroup.add(coreMesh);

    // Inner glowing nucleus
    const nucleusGeom = new THREE.SphereGeometry(2.2, 16, 16);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);
    universeGroup.add(nucleus);

    // 2. Torus Rings (Cash Flow Inflows & Outflows)
    const ring1Geom = new THREE.TorusGeometry(7.5, 0.08, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.7 });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    universeGroup.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(9.2, 0.06, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    universeGroup.add(ring2);

    // 3. Floating Asset Nodes & Star Particles
    const particlesCount = 280;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const radius = 6 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      posArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i * 3 + 2] = radius * Math.cos(phi);

      // Color scheme: Emerald (Inflows), Cyan (Net Worth), Violet (Investments), Amber (Expenses)
      const randColor = Math.random();
      if (randColor > 0.6) {
        colorsArray[i * 3] = 0.06; // R
        colorsArray[i * 3 + 1] = 0.72; // G
        colorsArray[i * 3 + 2] = 0.5; // B (emerald)
      } else if (randColor > 0.3) {
        colorsArray[i * 3] = 0.02; // R
        colorsArray[i * 3 + 1] = 0.71; // G
        colorsArray[i * 3 + 2] = 0.83; // B (cyan)
      } else {
        colorsArray[i * 3] = 0.5; // R
        colorsArray[i * 3 + 1] = 0.45; // G
        colorsArray[i * 3 + 2] = 0.95; // B (indigo)
      }
    }

    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeom.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particlesMesh = new THREE.Points(particlesGeom, particlesMat);
    universeGroup.add(particlesMesh);

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCounter = 0;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // FPS tracking
      frameCounter++;
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCounter * 1000) / (currentTime - lastTime)));
        frameCounter = 0;
        lastTime = currentTime;
      }

      // Parallax smooth interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 4;
      camera.position.y = 4 + targetY * 2.5;
      camera.lookAt(0, 0, 0);

      // Rotations
      if (isRotating) {
        universeGroup.rotation.y += 0.0035;
        coreMesh.rotation.x += 0.002;
        nucleus.rotation.y -= 0.005;
        ring1.rotation.z += 0.004;
        ring2.rotation.z -= 0.003;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      nucleusGeom.dispose();
      nucleusMat.dispose();
      ring1Geom.dispose();
      ring1Mat.dispose();
      ring2Geom.dispose();
      ring2Mat.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, [isRotating, activeVisualMode]);

  return (
    <div
      className={`relative w-full rounded-3xl border border-slate-800 bg-slate-950/80 overflow-hidden backdrop-blur-xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl h-[calc(100vh-32px)]' : 'h-[460px] md:h-[520px]'
      }`}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Ambient background glow behind canvas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top HUD Overlay (Aceternity & UIverse style) */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3.5 py-2 backdrop-blur-md pointer-events-auto shadow-lg">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" /> 3D Spatial Financial Radar
          </span>
          <span className="text-[10px] rounded-md bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 font-mono font-semibold border border-emerald-500/30">
            WebGL Three.js
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick HUD Metrics */}
          <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-1.5 text-xs backdrop-blur-md">
            <span className="text-slate-400 font-mono text-[11px]">FPS: <strong className="text-emerald-400">{fps}</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px]">Nodes: <strong className="text-cyan-400">{nodeCount}</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px]">Mesh: <strong className="text-indigo-400">Quantum 3.8</strong></span>
          </div>

          <button
            onClick={() => setIsRotating((prev) => !prev)}
            title="Toggle Constellation Rotation"
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <RefreshCw className={`h-4 w-4 ${isRotating ? 'text-emerald-400' : 'text-slate-500'}`} />
          </button>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            title="Toggle Expanded View"
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-emerald-400" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Floating Spatial HUD Cards (Aceternity Glass Style) */}
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pointer-events-none z-10">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/85 p-3.5 backdrop-blur-md pointer-events-auto hover:border-emerald-500/40 transition shadow-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <TrendingUp className="h-3 w-3" /> Monthly Inflow Vector
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono">Active Feed</span>
          </div>
          <p className="text-lg font-bold text-white tracking-tight font-mono">
            {currencySymbol}{monthlyIncome.toLocaleString()}
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full w-[82%]" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/85 p-3.5 backdrop-blur-md pointer-events-auto hover:border-indigo-500/40 transition shadow-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-indigo-400">
              <ShieldCheck className="h-3 w-3" /> Capital Retention Rate
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">Grade A</span>
          </div>
          <p className="text-lg font-bold text-white tracking-tight font-mono">
            {savingsRate}% <span className="text-xs font-normal text-slate-400">of inflows</span>
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${Math.min(100, savingsRate)}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/85 p-3.5 backdrop-blur-md pointer-events-auto hover:border-cyan-500/40 transition shadow-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
              <Activity className="h-3 w-3" /> Spatial Asset Clusters
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Synchronized</span>
          </div>
          <p className="text-lg font-bold text-white tracking-tight font-mono">
            {totalGoals} Active Goals <span className="text-xs font-normal text-slate-400">tracked</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Hover & drag mouse to rotate camera perspective in real-time 3D space.
          </p>
        </div>
      </div>
    </div>
  );
};
