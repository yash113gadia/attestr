import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ── Rotating icosahedron wireframe core ──
function Core() {
  const outerRef = useRef();
  const innerRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (outerRef.current) {
      outerRef.current.rotation.x = t * 0.1;
      outerRef.current.rotation.y = t * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -t * 0.08;
      innerRef.current.rotation.z = t * 0.12;
    }
  });

  return (
    <group>
      {/* Outer wireframe sphere */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.6, 2]} />
        <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.08} />
      </mesh>
      {/* Inner solid core */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.8, 3]} />
        <meshStandardMaterial
          color="#1a3060"
          metalness={0.8}
          roughness={0.15}
          emissive="#0d1f45"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Core glow */}
      <mesh>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.06} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// ── Orbiting data rings with moving dots ──
function DataRing({ radius = 2, speed = 0.3, tilt = 0, dotCount = 8, color = '#3B82F6', opacity = 0.12 }) {
  const groupRef = useRef();
  const dotsRef = useRef([]);

  const ringGeo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) groupRef.current.rotation.y += speed * 0.01;
    // Move dots along the ring
    dotsRef.current.forEach((dot, i) => {
      if (!dot) return;
      const a = (i / dotCount) * Math.PI * 2 + t * speed;
      dot.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    });
  });

  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      {/* Ring line */}
      <line geometry={ringGeo}>
        <lineBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} />
      </line>
      {/* Moving dots */}
      {Array.from({ length: dotCount }).map((_, i) => (
        <mesh key={i} ref={(el) => (dotsRef.current[i] = el)}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={opacity + 0.3} />
        </mesh>
      ))}
    </group>
  );
}

// ── Floating hash blocks ──
function HashBlocks({ count = 14 }) {
  const groupRef = useRef();
  const blocks = useMemo(() =>
    Array.from({ length: count }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 1.5;
      return {
        pos: [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)],
        size: 0.03 + Math.random() * 0.04,
        speed: 0.5 + Math.random() * 0.5,
      };
    }), [count]);

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <group ref={groupRef}>
      {blocks.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={[b.size, b.size, b.size]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ── Connection lines between random points ──
function Connections({ count = 20 }) {
  const ref = useRef();
  const lines = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const makePoint = () => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1.5 + Math.random() * 2;
        return new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      };
      arr.push([makePoint(), makePoint()]);
    }
    return arr;
  }, [count]);

  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.03; });

  return (
    <group ref={ref}>
      {lines.map((pts, i) => (
        <line key={i} geometry={new THREE.BufferGeometry().setFromPoints(pts)}>
          <lineBasicMaterial color="#3B82F6" transparent opacity={0.05} blending={THREE.AdditiveBlending} />
        </line>
      ))}
    </group>
  );
}

// ── Particle dust ──
function Dust({ count = 80 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 2.5;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.02; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#3B82F6" size={0.012} transparent opacity={0.4} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ── Pulse waves emanating from center ──
function PulseWaves() {
  const ring1 = useRef();
  const ring2 = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    const pulse = (ref, offset) => {
      if (!ref.current) return;
      const p = ((t + offset) % 4) / 4;
      ref.current.scale.setScalar(0.3 + p * 3);
      ref.current.material.opacity = 0.1 * (1 - p);
    };

    pulse(ring1, 0);
    pulse(ring2, 2);
  });

  return (
    <>
      <mesh ref={ring1} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1, 64]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ring2} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1, 64]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

// ── Vertical data stream ──
function DataStream() {
  const ref = useRef();
  const count = 40;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      arr[i * 3] = Math.cos(t * Math.PI * 6) * (0.8 + t * 1.5);
      arr[i * 3 + 1] = (t - 0.5) * 4;
      arr[i * 3 + 2] = Math.sin(t * Math.PI * 6) * (0.8 + t * 1.5);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const p = i / count;
      const a = p * Math.PI * 6 + t * 0.6;
      arr[i * 3] = Math.cos(a) * (0.8 + p * 1.5);
      arr[i * 3 + 2] = Math.sin(a) * (0.8 + p * 1.5);
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#22C55E" size={0.02} transparent opacity={0.35} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ── Mouse parallax ──
function Rig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 5.5));
  useFrame((state) => {
    target.current.set(state.pointer.x * 0.4, state.pointer.y * 0.25, 5.5);
    camera.position.lerp(target.current, 0.03);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function ShieldScene({ className = '', height = '100%' }) {
  return (
    <div className={className} style={{ height, width: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 3, 4]} intensity={0.4} color="#3B82F6" />
        <pointLight position={[0, 0, 3]} intensity={0.4} color="#3B82F6" distance={8} />

        <Core />
        <DataRing radius={2.2} speed={0.4} tilt={0.3} dotCount={6} opacity={0.1} />
        <DataRing radius={2.8} speed={-0.25} tilt={-0.5} dotCount={4} opacity={0.06} color="#6090ff" />
        <DataRing radius={1.5} speed={0.5} tilt={0.8} dotCount={8} opacity={0.08} />
        <HashBlocks count={12} />
        <Connections count={16} />
        <Dust count={70} />
        <DataStream />
        <PulseWaves />
        <Rig />
      </Canvas>
    </div>
  );
}
