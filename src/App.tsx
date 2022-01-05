import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  useGLTF,
  OrbitControls,
} from "@react-three/drei";
import { HexColorPicker } from "react-colorful";
import { proxy, useSnapshot } from "valtio";

const state = proxy({
  current: null,
  items: {
    roof: "#ffffff",
    sides: "#ffffff",
    trim: '#000000'
  },
});

function House() {
  const ref = useRef<any>();
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF("simplehouse1.glb") as any;

  // Animate model
  useFrame((state) => {
    if (ref.current) {
       ref.current.rotation.y += .001;
    }
  });

  // Cursor showing current color
  const [hovered, set] = useState(null);
  useEffect(() => {
    /** @ts-ignore-next-line */
    const cursor = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><g filter="url(#filter0_d)"><path d="M29.5 47C39.165 47 47 39.165 47 29.5S39.165 12 29.5 12 12 19.835 12 29.5 19.835 47 29.5 47z" fill="${snap.items[hovered]}"/></g><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/><text fill="#000" style="white-space:pre" font-family="Inter var, sans-serif" font-size="10" letter-spacing="-.01em"><tspan x="35" y="63">${hovered}</tspan></text></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h64v64H0z"/></clipPath><filter id="filter0_d" x="6" y="8" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="2"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`;
    const auto = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></svg>`;
    if (hovered) {
      document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(
        cursor
      )}'), auto`;
      return () => {
        document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(
          auto
        )}'), auto`;
      };
    }
  }, [hovered]);

  // Using the GLTFJSX output here to wire in app-state and hook up events
  return (
    <group
      ref={ref}
      dispose={null}
      onPointerOver={(e: any) => (
        e.stopPropagation(), set(e.object.material.name)
      )}
      onPointerOut={(e) => e.intersections.length === 0 && set(null)}
      onPointerMissed={() => (state.current = null)}
      onClick={(e: any) => (
        e.stopPropagation(), (state.current = e.object.material.name)
      )}
    >
      <mesh
        geometry={nodes.sides.geometry}
        material={materials.sides}
        position={[0, 0.5, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.02, 0.01, 0.01]}
        material-color={snap.items.sides}
      />
      <mesh
        geometry={nodes.roof.geometry}
        material={materials.roof}
        position={[0, 0.5, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.02, 0.01, 0.01]}
        material-color={snap.items.roof}
      />
      <mesh
        geometry={nodes.trim2.geometry}
        material={materials.trim}
        position={[1.01, 0.73, 0]}
        rotation={[Math.PI, 0, Math.PI / 2]}
        material-color={snap.items.trim}
      />
    </group>
  );
}

function Picker() {
  const snap = useSnapshot(state);
  return (
    <div style={{ display: snap.current ? "block" : "none" }}>
      <HexColorPicker
        className="picker"
        /** @ts-ignore-next-line */
        color={snap.items[snap.current]}
        /** @ts-ignore-next-line */
        onChange={(color) => (state.items[snap.current] = color)}
      />
      <h1>{snap.current}</h1>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Canvas shadows dpr={[1, 1]} camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <spotLight
          intensity={0.5}
          angle={0.1}
          penumbra={1}
          position={[10, 15, 10]}
          castShadow
        />
        <Suspense fallback={null}>
          <House />
          <Environment preset="city" />
          {/** @ts-ignore-next-line */}
          <ContactShadows
            rotation-x={Math.PI / 2}
            position={[0, -0.8, 0]}
            opacity={0.25}
            width={10}
            height={10}
            blur={1.5}
            far={0.8}
          />
        </Suspense>
        {/** @ts-ignore-next-line */}
        <OrbitControls
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>
      <Picker />
    </>
  );
}
