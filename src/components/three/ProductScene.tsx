"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, PresentationControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";

export { shapeNames } from "@/lib/shapes";

function Geometry({ shape }: { shape: string }) {
  switch (shape) {
    case "torusKnot": return <torusKnotGeometry args={[0.85, 0.28, 220, 32]} />;
    case "octahedron": return <octahedronGeometry args={[1.3, 0]} />;
    case "box": return <boxGeometry args={[1.6, 1.6, 1.6, 8, 8, 8]} />;
    case "capsule": return <capsuleGeometry args={[0.6, 1.1, 16, 32]} />;
    case "dodecahedron": return <dodecahedronGeometry args={[1.25, 0]} />;
    case "torus": return <torusGeometry args={[1, 0.38, 48, 120]} />;
    case "sphere": return <sphereGeometry args={[1.2, 64, 64]} />;
    default: return <icosahedronGeometry args={[1.25, 12]} />;
  }
}

function Model({ shape, color }: { shape: string; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) { ref.current.rotation.y += dt * 0.3; ref.current.rotation.x += dt * 0.1; }
    if (wire.current) { wire.current.rotation.y -= dt * 0.12; }
  });
  const smooth = ["icosahedron", "sphere", "torusKnot", "capsule", "torus"].includes(shape);
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref}>
        <Geometry shape={shape} />
        {smooth ? (
          <MeshDistortMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.2} metalness={0.7} distort={0.18} speed={1.4} />
        ) : (
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.2} metalness={0.85} flatShading />
        )}
      </mesh>
      <mesh ref={wire} scale={1.35}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.18} />
      </mesh>
    </Float>
  );
}

export default function ProductScene({ shape, color, active = true }: { shape: string; color: string; active?: boolean }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.75]} camera={{ position: [0, 0, 5.2], fov: 45 }} gl={{ alpha: true, antialias: true }} aria-hidden="true">
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 3, 4]} intensity={45} color="#00D4FF" />
      <pointLight position={[-4, -2, 3]} intensity={35} color="#625BFF" />
      <directionalLight position={[0, 5, 5]} intensity={0.9} />
      <PresentationControls global={false} cursor snap polar={[-0.4, 0.4]} azimuth={[-0.9, 0.9]}>
        <Model shape={shape} color={color} />
      </PresentationControls>
      <Sparkles count={50} scale={[6, 5, 4]} size={2} speed={0.3} color={color} />
    </Canvas>
  );
}
