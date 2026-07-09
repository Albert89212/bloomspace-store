import { Canvas } from "@react-three/fiber";
import { PresentationControls, Environment, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

// Lightweight 3D placeholder — replace <PlaceholderModel /> with useGLTF(url)
// when real .glb assets are available.
function PlaceholderModel() {
  return (
    <group>
      {/* Seat */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[1.4, 0.1, 1.2]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.75, -0.55]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[1.4, 1.4, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[
        [-0.6, -0.4, -0.5],
        [0.6, -0.4, -0.5],
        [-0.6, -0.4, 0.5],
        [0.6, -0.4, 0.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.9, 16]} />
          <meshStandardMaterial color="#8a8a8a" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      {/* Armrests */}
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, 0.35, 0]} castShadow>
          <boxGeometry args={[0.06, 0.5, 1.2]} />
          <meshStandardMaterial color="#8a8a8a" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

export function Product3DViewer() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-surface">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [2.4, 1.6, 2.8], fov: 35 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <Suspense fallback={null}>
          <PresentationControls
            global
            polar={[-0.3, 0.4]}
            azimuth={[-0.8, 0.8]}
            snap
            speed={1.5}
          >
            <PlaceholderModel />
          </PresentationControls>
          <ContactShadows position={[0, -0.85, 0]} opacity={0.4} scale={5} blur={2.5} far={2} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
        3D · перетащите для вращения
      </div>
    </div>
  );
}