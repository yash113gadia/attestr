import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Animated fingerprint — concentric rings that pulse like a hash being computed
function FingerprintRings() {
  const groupRef = useRef();
  const ringsRef = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) groupRef.current.rotation.z = t * 0.05;
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = (t * 0.8 + i * 0.3) % 3;
      const scale = 0.3 + (i * 0.15);
      ring.scale.setScalar(scale + Math.sin(phase) * 0.02);
      ring.material.opacity = 0.15 + Math.sin(t * 1.5 + i * 0.5) * 0.08;
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} ref={(el) => (ringsRef.current[i] = el)} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3 + i * 0.15, 0.008, 8, 64]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {/* Center dot */}
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// Hash bits visualized as a grid of flickering squares
function HashGrid() {
  const ref = useRef();
  const cells = useMemo(() => {
    const arr = [];
    const size = 8;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        arr.push({
          pos: [(x - size / 2 + 0.5) * 0.12, (y - size / 2 + 0.5) * 0.12, 0],
          delay: Math.random() * 5,
        });
      }
    }
    return arr;
  }, []);

  const meshRefs = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) ref.current.rotation.y = Math.sin(t * 0.2) * 0.1;
    meshRefs.current.forEach((m, i) => {
      if (!m) return;
      const on = Math.sin(t * 2 + cells[i].delay) > 0.3;
      m.material.opacity = on ? 0.5 : 0.05;
    });
  });

  return (
    <group ref={ref} position={[0, 0, -0.5]}>
      {cells.map((c, i) => (
        <mesh key={i} position={c.pos} ref={(el) => (meshRefs.current[i] = el)}>
          <planeGeometry args={[0.09, 0.09]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Scanning beam
function ScanBeam() {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime % 3) / 3;
    ref.current.position.y = (t - 0.5) * 1.5;
    ref.current.material.opacity = 0.3 * (1 - Math.abs(t - 0.5) * 2);
  });
  return (
    <mesh ref={ref}>
      <planeGeometry args={[1.8, 0.01]} />
      <meshBasicMaterial color="#3B82F6" transparent opacity={0.3} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

export default function FingerprintViz({ className = '', size = 200 }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 30 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <FingerprintRings />
        <HashGrid />
        <ScanBeam />
      </Canvas>
    </div>
  );
}
