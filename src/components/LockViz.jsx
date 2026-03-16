import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D padlock with encryption particle effects
function Padlock() {
  const groupRef = useRef();
  const particlesRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;
    }
    if (particlesRef.current) {
      const arr = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2 + t * 1.5;
        const r = 0.5 + Math.sin(t * 2 + i) * 0.1;
        arr[i * 3] = Math.cos(a) * r;
        arr[i * 3 + 1] = 0.1 + Math.sin(t + i * 0.5) * 0.3;
        arr[i * 3 + 2] = Math.sin(a) * r;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particlePos = useMemo(() => {
    const arr = new Float32Array(60);
    for (let i = 0; i < 20; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.8;
      arr[i * 3 + 1] = Math.random() * 0.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    return arr;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Lock body */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.25]} />
        <meshStandardMaterial color="#1a2d50" metalness={0.7} roughness={0.2} emissive="#0d1f45" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.52, 0.42, 0.27]} />
        <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.1} />
      </mesh>

      {/* Shackle — half torus */}
      <mesh position={[0, 0.12, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.15, 0.04, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#2a5aaa" metalness={0.8} roughness={0.15} emissive="#1a3a7e" emissiveIntensity={0.3} />
      </mesh>

      {/* Keyhole */}
      <mesh position={[0, -0.18, 0.13]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.5} />
      </mesh>

      {/* Encryption particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={20} array={particlePos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#3B82F6" size={0.015} transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
}

export default function LockViz({ className = '', size = 150 }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 35 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} intensity={0.6} />
        <pointLight position={[0, 0, 1.5]} intensity={0.3} color="#3B82F6" distance={4} />
        <Padlock />
      </Canvas>
    </div>
  );
}
