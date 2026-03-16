import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Core() {
  const ref = useRef();
  const wireRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) { ref.current.rotation.y = t * 0.3; ref.current.rotation.x = Math.sin(t * 0.2) * 0.1; }
    if (wireRef.current) { wireRef.current.rotation.y = -t * 0.15; wireRef.current.rotation.z = t * 0.1; }
  });

  return (
    <group>
      {/* Solid core */}
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.4, 2]} />
        <meshPhysicalMaterial color="#0a1628" metalness={0.5} roughness={0.2} transmission={0.4} thickness={0.3} ior={1.5} />
      </mesh>
      {/* Outer wireframe */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.2} />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function OrbitRing({ radius, speed, count = 6, tilt = 0 }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) pts.push(new THREE.Vector3(Math.cos((i / 64) * Math.PI * 2) * radius, 0, Math.sin((i / 64) * Math.PI * 2) * radius));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * speed; });

  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <line geometry={geo}><lineBasicMaterial color="#3B82F6" transparent opacity={0.1} /></line>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshBasicMaterial color="#3B82F6" transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function Pulse() {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime % 2) / 2;
    ref.current.scale.setScalar(0.3 + t * 1.5);
    ref.current.material.opacity = 0.12 * (1 - t);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#3B82F6" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

export default function BlockchainOrb({ className = '', size = 200 }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 35 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 2, 2]} intensity={0.3} color="#3B82F6" />
        <Core />
        <OrbitRing radius={0.85} speed={0.5} count={4} />
        <OrbitRing radius={1.1} speed={-0.35} count={6} tilt={0.4} />
        <OrbitRing radius={1.35} speed={0.25} count={3} tilt={-0.3} />
        <Pulse />
      </Canvas>
    </div>
  );
}
