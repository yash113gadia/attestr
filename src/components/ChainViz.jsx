import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Animated blockchain — blocks connected by lines, growing
function Chain() {
  const groupRef = useRef();
  const blockCount = 6;

  const blocks = useMemo(() =>
    Array.from({ length: blockCount }, (_, i) => ({
      pos: [i * 0.6 - (blockCount * 0.6) / 2 + 0.3, Math.sin(i * 0.8) * 0.15, 0],
    })), []);

  const meshRefs = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.15;
    meshRefs.current.forEach((m, i) => {
      if (!m) return;
      // Subtle floating
      m.position.y = blocks[i].pos[1] + Math.sin(t * 0.8 + i) * 0.03;
      // Pulse the latest block
      if (i === blockCount - 1) {
        m.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {blocks.map((b, i) => (
        <group key={i}>
          {/* Block */}
          <mesh position={b.pos} ref={(el) => (meshRefs.current[i] = el)}>
            <boxGeometry args={[0.35, 0.25, 0.15]} />
            <meshStandardMaterial
              color={i === blockCount - 1 ? '#2563EB' : '#1a2d50'}
              metalness={0.6}
              roughness={0.3}
              emissive={i === blockCount - 1 ? '#3B82F6' : '#0d1a30'}
              emissiveIntensity={i === blockCount - 1 ? 0.5 : 0.2}
            />
          </mesh>
          {/* Wireframe */}
          <mesh position={b.pos}>
            <boxGeometry args={[0.36, 0.26, 0.16]} />
            <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={i === blockCount - 1 ? 0.2 : 0.08} />
          </mesh>
          {/* Connection to next */}
          {i < blockCount - 1 && (
            <line geometry={new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(...b.pos),
              new THREE.Vector3(...blocks[i + 1].pos),
            ])}>
              <lineBasicMaterial color="#3B82F6" transparent opacity={0.2} />
            </line>
          )}
        </group>
      ))}
      {/* Mining particles around latest block */}
      <MiningParticles position={blocks[blockCount - 1].pos} />
    </group>
  );
}

function MiningParticles({ position }) {
  const ref = useRef();
  const count = 12;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * 0.3;
      arr[i * 3 + 1] = Math.sin(a) * 0.3;
      arr[i * 3 + 2] = 0;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + t * 2;
      const r = 0.25 + Math.sin(t * 3 + i) * 0.08;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.sin(a) * r;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#22C55E" size={0.02} transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

export default function ChainViz({ className = '', size = 300, height = 150 }) {
  return (
    <div className={className} style={{ width: size, height }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 30 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} intensity={0.6} />
        <pointLight position={[1.5, 0, 1]} intensity={0.3} color="#3B82F6" distance={5} />
        <Chain />
      </Canvas>
    </div>
  );
}
