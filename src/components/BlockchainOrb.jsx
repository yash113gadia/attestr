import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function OrbCore() {
  const wireRef = useRef();
  const solidRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (wireRef.current) {
      wireRef.current.rotation.x = t * 0.15;
      wireRef.current.rotation.y = t * 0.2;
    }
    if (solidRef.current) {
      solidRef.current.rotation.x = -t * 0.1;
      solidRef.current.rotation.z = t * 0.12;
    }
  });

  return (
    <group>
      <mesh ref={solidRef}>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#1a3060" metalness={0.8} roughness={0.15} emissive="#0d1f45" emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={wireRef}>
        <dodecahedronGeometry args={[0.55, 0]} />
        <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.06} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function MiniRing({ radius, speed, count = 4 }) {
  const ref = useRef();
  const dotsRef = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) ref.current.rotation.y += speed * 0.01;
    dotsRef.current.forEach((d, i) => {
      if (!d) return;
      const a = (i / count) * Math.PI * 2 + t * speed;
      d.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    });
  });

  return (
    <group ref={ref}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => (dotsRef.current[i] = el)}>
          <boxGeometry args={[0.03, 0.03, 0.03]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Pulse() {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime % 2.5) / 2.5;
    ref.current.scale.setScalar(0.3 + t * 1.5);
    ref.current.material.opacity = 0.08 * (1 - t);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshBasicMaterial color="#3B82F6" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

export default function BlockchainOrb({ className = '', size = 200 }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 35 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={0.4} color="#3B82F6" />
        <OrbCore />
        <MiniRing radius={0.85} speed={0.6} count={4} />
        <MiniRing radius={1.1} speed={-0.4} count={3} />
        <Pulse />
      </Canvas>
    </div>
  );
}
