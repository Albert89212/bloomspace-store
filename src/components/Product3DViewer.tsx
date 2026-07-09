import { Canvas } from "@react-three/fiber";
import { PresentationControls, Environment, ContactShadows } from "@react-three/drei";
import { Suspense, useState } from "react";

// Lightweight parametric garden bench — real .glb assets can be swapped in later.
function GardenBench({ wood, metal }: { wood: string; metal: string }) {
  const slats: number[] = [-0.55, -0.28, 0, 0.28, 0.55];
  return (
    <group>
      {/* Seat slats */}
      {slats.map((z, i) => (
        <mesh key={`s${i}`} position={[0, 0.05, z * 0.4]} castShadow>
          <boxGeometry args={[2.0, 0.06, 0.16]} />
          <meshStandardMaterial color={wood} roughness={0.7} metalness={0.05} />
        </mesh>
      ))}
      {/* Back slats */}
      {[0.55, 0.75, 0.95].map((y, i) => (
        <mesh key={`b${i}`} position={[0, y, -0.28]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[2.0, 0.09, 0.05]} />
          <meshStandardMaterial color={wood} roughness={0.7} metalness={0.05} />
        </mesh>
      ))}
      {/* Side frames */}
      {[-0.95, 0.95].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <boxGeometry args={[0.08, 0.8, 0.6]} />
            <meshStandardMaterial color={metal} metalness={0.9} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.5, -0.3]} castShadow>
            <boxGeometry args={[0.08, 1.0, 0.08]} />
            <meshStandardMaterial color={metal} metalness={0.9} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.18, 0.05]} rotation={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.08, 0.55]} />
            <meshStandardMaterial color={metal} metalness={0.9} roughness={0.28} />
          </mesh>
        </group>
      ))}
      {/* Feet */}
      {[
        [-0.95, -0.78, -0.28],
        [-0.95, -0.78, 0.28],
        [0.95, -0.78, -0.28],
        [0.95, -0.78, 0.28],
      ].map((p, i) => (
        <mesh key={`f${i}`} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[0.14, 0.05, 0.14]} />
          <meshStandardMaterial color={metal} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

const WOODS = [
  { name: "Тик", value: "#a76a3d" },
  { name: "Орех", value: "#5b3a22" },
  { name: "Дуб", value: "#c9a06a" },
  { name: "Графит", value: "#2a2a2a" },
];
const METALS = [
  { name: "Графит", value: "#2b2b2b" },
  { name: "Сталь", value: "#9aa0a6" },
  { name: "Бронза", value: "#8a5a2b" },
  { name: "Изумруд", value: "#2f6f5a" },
];

export function Product3DViewer() {
  const [wood, setWood] = useState(WOODS[0].value);
  const [metal, setMetal] = useState(METALS[0].value);
  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-3xl"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 10%, color-mix(in oklab, var(--accent-cool) 15%, var(--surface)), var(--surface))",
        }}
      >
        <Canvas shadows dpr={[1, 2]} camera={{ position: [3.0, 1.8, 3.4], fov: 35 }}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 6, 4]} intensity={1.0} castShadow />
          <Suspense fallback={null}>
            <PresentationControls
              global
              polar={[-0.3, 0.4]}
              azimuth={[-0.9, 0.9]}
              snap
              speed={1.4}
            >
              <GardenBench wood={wood} metal={metal} />
            </PresentationControls>
            <ContactShadows position={[0, -0.82, 0]} opacity={0.45} scale={6} blur={2.5} far={2.5} />
            <Environment preset="park" />
          </Suspense>
        </Canvas>
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          3D · перетащите для вращения
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Swatches label="Дерево" options={WOODS} value={wood} onChange={setWood} />
        <Swatches label="Металл" options={METALS} value={metal} onChange={setMetal} />
      </div>
    </div>
  );
}

function Swatches({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { name: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-background p-3">
      <div className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            title={o.name}
            aria-label={o.name}
            className={`h-7 w-7 rounded-full ring-offset-2 transition-all ${
              value === o.value ? "ring-2 ring-foreground" : "ring-1 ring-hairline"
            }`}
            style={{ backgroundColor: o.value }}
          />
        ))}
      </div>
    </div>
  );
}