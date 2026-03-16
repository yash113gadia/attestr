import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function GridPlane() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.position.z = -((state.clock.elapsedTime * 0.3) % 1);
  });
  return (
    <group ref={ref}>
      <gridHelper args={[40, 40, '#1a2540', '#1a2540']} position={[0, -2, 0]} />
    </group>
  );
}

function FloatingDots({ count = 20 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#3B82F6" size={0.02} transparent opacity={0.2} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

export default function GridBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }} dpr={1} gl={{ alpha: true, antialias: false }} style={{ background: 'transparent' }}>
        <GridPlane />
        <FloatingDots />
      </Canvas>
    </div>
  );
}
