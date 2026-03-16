import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ── Animated particle field ──
function ParticleField({ count = 200 }) {
  const ref = useRef();
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 3;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      vel.push({ speed: 0.002 + Math.random() * 0.005, axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize() });
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]);
      v.applyAxisAngle(velocities[i].axis, velocities[i].speed);
      arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#3B82F6" size={0.015} transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ── Glowing connection lines between random points ──
function NetworkGraph({ nodeCount = 20 }) {
  const groupRef = useRef();
  const { nodes, edges } = useMemo(() => {
    const n = [];
    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * 1.2;
      n.push(new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)));
    }
    const e = [];
    for (let i = 0; i < n.length; i++) {
      for (let j = i + 1; j < n.length; j++) {
        if (n[i].distanceTo(n[j]) < 2.0) e.push([n[i], n[j]]);
      }
    }
    return { nodes: n, edges: e };
  }, [nodeCount]);

  useFrame((_, d) => { if (groupRef.current) groupRef.current.rotation.y += d * 0.06; });

  return (
    <group ref={groupRef}>
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.7} />
        </mesh>
      ))}
      {edges.map((e, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints(e);
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#3B82F6" transparent opacity={0.12} blending={THREE.AdditiveBlending} />
          </line>
        );
      })}
    </group>
  );
}

// ── Orbiting hex rings ──
function HexOrbit({ radius = 2.2, speed = 0.3, opacity = 0.2, tilt = 0 }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * speed; });

  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <line geometry={geo}>
        <lineBasicMaterial color="#3B82F6" transparent opacity={opacity} blending={THREE.AdditiveBlending} />
      </line>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
        return (
          <mesh key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#3B82F6" transparent opacity={opacity + 0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Central shield with glass + glow ──
function CentralShield() {
  const groupRef = useRef();
  const glowRef = useRef();

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 1.3);
    s.lineTo(0.95, 0.75);
    s.lineTo(0.95, -0.15);
    s.quadraticCurveTo(0.75, -1.1, 0, -1.4);
    s.quadraticCurveTo(-0.75, -1.1, -0.95, -0.15);
    s.lineTo(-0.95, 0.75);
    s.lineTo(0, 1.3);
    return s;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.12;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.06 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Shield body — dark glass */}
        <mesh position={[0, 0, -0.05]}>
          <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4 }]} />
          <meshPhysicalMaterial
            color="#0a1628"
            metalness={0.3}
            roughness={0.15}
            transmission={0.6}
            thickness={0.5}
            ior={1.5}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Shield edge glow */}
        <mesh ref={glowRef} position={[0, 0, -0.06]}>
          <extrudeGeometry args={[shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 }]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.06} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Inner wireframe */}
        <mesh position={[0, 0, -0.04]}>
          <extrudeGeometry args={[shape, { depth: 0.08, bevelEnabled: false }]} />
          <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.08} />
        </mesh>

        {/* Checkmark */}
        <group position={[0, -0.05, 0.12]}>
          <mesh>
            <torusGeometry args={[0.35, 0.025, 8, 32]} />
            <meshBasicMaterial color="#3B82F6" transparent opacity={0.25} />
          </mesh>
          {(() => {
            const pts = [new THREE.Vector3(-0.2, 0, 0), new THREE.Vector3(-0.05, -0.18, 0), new THREE.Vector3(0.25, 0.2, 0)];
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            return <line geometry={geo}><lineBasicMaterial color="#3B82F6" linewidth={2} /></line>;
          })()}
        </group>
      </group>
    </Float>
  );
}

// ── Scanning pulse ring ──
function PulseRing() {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime % 3) / 3;
    ref.current.scale.setScalar(0.5 + t * 2.5);
    ref.current.material.opacity = 0.15 * (1 - t);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.95, 1, 64]} />
      <meshBasicMaterial color="#3B82F6" transparent opacity={0.15} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

// ── Data stream rings ──
function DataStream({ count = 30 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const a = t * Math.PI * 4;
      const r = 1.5 + t * 1;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = (t - 0.5) * 3;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const a = t * Math.PI * 4 + state.clock.elapsedTime * 0.5;
      const r = 1.5 + t * 1;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#22C55E" size={0.025} transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ── Mouse parallax ──
function Rig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 5));

  useFrame((state) => {
    const x = state.pointer.x * 0.3;
    const y = state.pointer.y * 0.2;
    target.current.set(x, y, 5);
    camera.position.lerp(target.current, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function ShieldScene({ className = '', height = '100%' }) {
  return (
    <div className={className} style={{ height, width: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <directionalLight position={[-3, -2, 3]} intensity={0.2} color="#3B82F6" />
        <pointLight position={[0, 0, 3]} intensity={0.4} color="#3B82F6" distance={8} />

        <CentralShield />
        <HexOrbit radius={2.0} speed={0.2} opacity={0.12} tilt={0.3} />
        <HexOrbit radius={2.6} speed={-0.15} opacity={0.07} tilt={-0.2} />
        <HexOrbit radius={1.4} speed={0.28} opacity={0.09} tilt={0.5} />
        <NetworkGraph nodeCount={25} />
        <ParticleField count={150} />
        <DataStream count={40} />
        <PulseRing />
        <Rig />
      </Canvas>
    </div>
  );
}
