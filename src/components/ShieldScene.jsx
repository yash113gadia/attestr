import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// ── Particle field ──
function ParticleField({ count = 120 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.04; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#3B82F6" size={0.015} transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ── Network graph ──
function NetworkGraph({ nodeCount = 18 }) {
  const ref = useRef();
  const { nodes, edges } = useMemo(() => {
    const n = [];
    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random();
      n.push(new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)));
    }
    const e = [];
    for (let i = 0; i < n.length; i++)
      for (let j = i + 1; j < n.length; j++)
        if (n[i].distanceTo(n[j]) < 1.8) e.push([n[i], n[j]]);
    return { nodes: n, edges: e };
  }, [nodeCount]);

  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.05; });

  return (
    <group ref={ref}>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.6} />
        </mesh>
      ))}
      {edges.map((e, i) => (
        <line key={i} geometry={new THREE.BufferGeometry().setFromPoints(e)}>
          <lineBasicMaterial color="#3B82F6" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
        </line>
      ))}
    </group>
  );
}

// ── Hex orbit rings ──
function HexOrbit({ radius = 2, speed = 0.2, opacity = 0.15, tilt = 0 }) {
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
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshBasicMaterial color="#3B82F6" transparent opacity={opacity + 0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Central shield — proper 3D with depth ──
function CentralShield() {
  const groupRef = useRef();
  const glowRef = useRef();

  // Shield outline shape
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 1.35);
    s.lineTo(0.95, 0.75);
    s.lineTo(0.95, -0.1);
    s.bezierCurveTo(0.95, -0.7, 0.6, -1.2, 0, -1.5);
    s.bezierCurveTo(-0.6, -1.2, -0.95, -0.7, -0.95, -0.1);
    s.lineTo(-0.95, 0.75);
    s.lineTo(0, 1.35);
    return s;
  }, []);

  // Inner cutout for the border effect
  const innerShape = useMemo(() => {
    const s = new THREE.Shape();
    const inset = 0.85;
    s.moveTo(0, 1.35 * inset);
    s.lineTo(0.95 * inset, 0.75 * inset);
    s.lineTo(0.95 * inset, -0.1 * inset);
    s.bezierCurveTo(0.95 * inset, -0.7 * inset, 0.6 * inset, -1.2 * inset, 0, -1.5 * inset);
    s.bezierCurveTo(-0.6 * inset, -1.2 * inset, -0.95 * inset, -0.7 * inset, -0.95 * inset, -0.1 * inset);
    s.lineTo(-0.95 * inset, 0.75 * inset);
    s.lineTo(0, 1.35 * inset);
    return s;
  }, []);

  const extrudeOpts = useMemo(() => ({
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.04,
    bevelSegments: 3,
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.35) * 0.15;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.08 + Math.sin(t * 1.8) * 0.04;
    }
  });

  // Checkmark path
  const checkPath = useMemo(() => {
    const p = new THREE.CurvePath();
    p.add(new THREE.LineCurve3(new THREE.Vector3(-0.25, 0, 0), new THREE.Vector3(-0.08, -0.22, 0)));
    p.add(new THREE.LineCurve3(new THREE.Vector3(-0.08, -0.22, 0), new THREE.Vector3(0.3, 0.24, 0)));
    return p;
  }, []);

  return (
    <Float speed={1} rotationIntensity={0.12} floatIntensity={0.35}>
      <group ref={groupRef}>
        {/* Main shield body — dark with metallic finish */}
        <mesh position={[0, 0, -0.09]}>
          <extrudeGeometry args={[shape, extrudeOpts]} />
          <meshStandardMaterial
            color="#0c1525"
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>

        {/* Blue edge highlight — slightly larger, behind the body */}
        <mesh position={[0, 0, -0.1]}>
          <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.05, bevelSegments: 2 }]} />
          <meshStandardMaterial color="#1a3a6e" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Inner face — darker recessed area */}
        <mesh position={[0, 0, -0.05]}>
          <extrudeGeometry args={[innerShape, { depth: 0.16, bevelEnabled: false }]} />
          <meshStandardMaterial color="#080e1a" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Blue wireframe overlay for tech feel */}
        <mesh position={[0, 0, -0.08]}>
          <extrudeGeometry args={[shape, { depth: 0.16, bevelEnabled: false }]} />
          <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.06} />
        </mesh>

        {/* Front face glow — pulses */}
        <mesh ref={glowRef} position={[0, 0, 0.1]}>
          <shapeGeometry args={[innerShape]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.08} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Checkmark — bright, prominent */}
        <group position={[0, -0.05, 0.14]}>
          {/* Core tick — white/bright blue, thick */}
          <mesh>
            <tubeGeometry args={[checkPath, 24, 0.055, 10, false]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Blue shell around the white core */}
          <mesh>
            <tubeGeometry args={[checkPath, 24, 0.07, 10, false]} />
            <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={1} metalness={0.2} roughness={0.3} />
          </mesh>
          {/* Outer glow — large soft halo */}
          <mesh>
            <tubeGeometry args={[checkPath, 24, 0.15, 8, false]} />
            <meshBasicMaterial color="#3B82F6" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {/* Extra wide ambient glow */}
          <mesh>
            <tubeGeometry args={[checkPath, 24, 0.3, 8, false]} />
            <meshBasicMaterial color="#3B82F6" transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

// ── Pulse ring ──
function PulseRing() {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime % 3) / 3;
    ref.current.scale.setScalar(0.5 + t * 2);
    ref.current.material.opacity = 0.12 * (1 - t);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.9, 1, 48]} />
      <meshBasicMaterial color="#3B82F6" transparent opacity={0.12} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

// ── Data stream ──
function DataStream({ count = 30 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      arr[i * 3] = Math.cos(t * Math.PI * 4) * (1.5 + t);
      arr[i * 3 + 1] = (t - 0.5) * 3;
      arr[i * 3 + 2] = Math.sin(t * Math.PI * 4) * (1.5 + t);
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const a = t * Math.PI * 4 + state.clock.elapsedTime * 0.5;
      arr[i * 3] = Math.cos(a) * (1.5 + t);
      arr[i * 3 + 2] = Math.sin(a) * (1.5 + t);
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#22C55E" size={0.02} transparent opacity={0.4} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ── Mouse parallax ──
function Rig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 5));
  useFrame((state) => {
    target.current.set(state.pointer.x * 0.3, state.pointer.y * 0.2, 5);
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
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <directionalLight position={[-3, -2, 3]} intensity={0.3} color="#3B82F6" />
        <pointLight position={[0, 0, 2]} intensity={0.3} color="#3B82F6" distance={6} />

        <CentralShield />
        <HexOrbit radius={2} speed={0.18} opacity={0.12} tilt={0.3} />
        <HexOrbit radius={2.5} speed={-0.12} opacity={0.07} tilt={-0.2} />
        <HexOrbit radius={1.4} speed={0.22} opacity={0.09} tilt={0.5} />
        <NetworkGraph nodeCount={18} />
        <ParticleField count={100} />
        <DataStream count={30} />
        <PulseRing />
        <Rig />
      </Canvas>
    </div>
  );
}
