"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

export type Satellite = { color: string; label: string };

function PulseCore() {
  const shell = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (shell.current) { shell.current.rotation.y += dt * 0.15; shell.current.rotation.x += dt * 0.05; }
    if (inner.current) inner.current.rotation.y -= dt * 0.25;
    // the "pulse": a heartbeat-like scale on the halo
    if (halo.current) {
      const beat = Math.pow(Math.sin(t * 1.6) * 0.5 + 0.5, 6);
      halo.current.scale.setScalar(1.55 + beat * 0.25);
      (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + beat * 0.12;
    }
  });
  return (
    <group>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.05, 24]} />
        <MeshDistortMaterial color="#1c3fae" emissive="#2a5cff" emissiveIntensity={0.55} roughness={0.15} metalness={0.6} distort={0.32} speed={1.6} />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.45, 1]} />
        <meshBasicMaterial color="#00D4FF" wireframe transparent opacity={0.35} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.1} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function Orbit({ radius, tilt, speed, satellites }: { radius: number; tilt: [number, number, number]; speed: number; satellites: Satellite[] }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * speed; });
  return (
    <group rotation={tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.006, 8, 160]} />
        <meshBasicMaterial color="#3478FF" transparent opacity={0.45} />
      </mesh>
      <group ref={group}>
        {satellites.map((s, i) => {
          const a = (i / satellites.length) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}>
              <sphereGeometry args={[0.085, 24, 24]} />
              <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={1.6} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function FloatingShapes() {
  const shapes = useMemo(
    () => [
      { pos: [-3.6, 1.4, -1.5] as const, geo: "oct", color: "#625BFF", s: 0.42 },
      { pos: [3.7, -1.2, -1] as const, geo: "box", color: "#3478FF", s: 0.38 },
      { pos: [2.9, 1.9, -2.5] as const, geo: "tor", color: "#00D4FF", s: 0.3 },
      { pos: [-2.8, -1.9, -0.6] as const, geo: "dod", color: "#00D4FF", s: 0.3 },
    ],
    [],
  );
  return (
    <>
      {shapes.map((s, i) => (
        <Float key={i} speed={1.4 + i * 0.3} rotationIntensity={1.2} floatIntensity={1.4}>
          <mesh position={s.pos as unknown as [number, number, number]} scale={s.s}>
            {s.geo === "oct" && <octahedronGeometry args={[1, 0]} />}
            {s.geo === "box" && <boxGeometry args={[1.2, 1.2, 1.2]} />}
            {s.geo === "tor" && <torusGeometry args={[1, 0.36, 16, 48]} />}
            {s.geo === "dod" && <dodecahedronGeometry args={[1, 0]} />}
            <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.25} roughness={0.25} metalness={0.8} flatShading />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/** Camera follows the pointer and dollies back as the page scrolls. */
function CameraRig() {
  const { camera, pointer } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const scroll = Math.min(window.scrollY / window.innerHeight, 1.2);
    target.set(pointer.x * 0.8, pointer.y * 0.5 + scroll * 0.6, 7 + scroll * 3.5);
    camera.position.lerp(target, 1 - Math.pow(0.0015, dt));
    camera.lookAt(0, scroll * -0.4, 0);
  });
  return null;
}

function Lights() {
  const a = useRef<THREE.PointLight>(null);
  const b = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.5;
    if (a.current) a.current.position.set(Math.cos(t) * 4, 2, Math.sin(t) * 4);
    if (b.current) b.current.position.set(Math.cos(t + Math.PI) * 4, -2, Math.sin(t + Math.PI) * 4);
  });
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight ref={a} color="#00D4FF" intensity={40} distance={14} />
      <pointLight ref={b} color="#625BFF" intensity={40} distance={14} />
      <directionalLight position={[3, 5, 4]} intensity={0.8} color="#bcd4ff" />
    </>
  );
}

export default function HeroScene({ satellites, lite = false, active = true }: { satellites: Satellite[]; lite?: boolean; active?: boolean }) {
  const inner = satellites.slice(0, Math.ceil(satellites.length / 2));
  const outer = satellites.slice(Math.ceil(satellites.length / 2));
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <Lights />
      <group position={[lite ? 1.15 : 0.9, lite ? 2.1 : 0, 0]} scale={lite ? 0.55 : 0.92}>
        <PulseCore />
        <Orbit radius={2.05} tilt={[0.35, 0, 0.15]} speed={0.22} satellites={inner} />
        <Orbit radius={2.6} tilt={[-0.25, 0, -0.35]} speed={-0.14} satellites={outer} />
      </group>
      {!lite && <FloatingShapes />}
      <Sparkles count={lite ? 60 : 180} scale={[14, 8, 8]} size={2.2} speed={0.35} color="#9ad8ff" opacity={0.6} />
      <CameraRig />
    </Canvas>
  );
}
