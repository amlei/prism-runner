import { useState, useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGameStore, COLORS } from './store';
import * as THREE from 'three';

type PlatformDef = {
  id: number;
  x: number;
  y: number;
  length: number;
  color: number;
};

let platformIdCounter = 0;

function generateInitialPlatforms(): PlatformDef[] {
  const platforms: PlatformDef[] = [];
  // Starting safe platform
  platforms.push({
    id: platformIdCounter++,
    x: 0,
    y: 0,
    length: 30,
    color: 0,
  });

  let currentX = 15;
  let currentY = 0;

  for (let i = 0; i < 15; i++) {
    const gap = Math.random() * 5 + 3; // Gap between 3 and 8
    const length = Math.random() * 15 + 10; // Length between 10 and 25
    const yChange = (Math.random() - 0.5) * 6; // Y change between -3 and 3
    const newY = Math.max(-5, Math.min(10, currentY + yChange));
    const nextColor = Math.random() > 0.5 ? 1 : 0;

    const xPos = currentX + gap + length / 2;
    platforms.push({
      id: platformIdCounter++,
      x: xPos,
      y: newY,
      length,
      color: nextColor,
    });
    currentX = xPos + length / 2;
    currentY = newY;
  }
  return platforms;
}

export function PlatformManager() {
  const [platforms, setPlatforms] = useState<PlatformDef[]>([]);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const status = useGameStore((state) => state.status);
  const gameId = useGameStore((state) => state.gameId);

  useEffect(() => {
    if (status === 'start' || gameId >= 0) {
      const initial = generateInitialPlatforms();
      setPlatforms(initial);
      const last = initial[initial.length - 1];
      lastXRef.current = last.x + last.length / 2;
      lastYRef.current = last.y;
    }
  }, [status, gameId]);

  useFrame((state) => {
    if (status !== 'playing') return;

    const cameraX = state.camera.position.x;

    // Remove platforms far behind and add new ones ahead
    setPlatforms((prev) => {
      // Find platforms that are still relevant (e.g. x + length/2 > cameraX - 20)
      const visiblePlatforms = prev.filter((p) => p.x + p.length / 2 > cameraX - 20);

      // Add new ones if we have less than 15 platforms
      if (visiblePlatforms.length < 15) {
        const gap = Math.random() * 6 + 4; // Gap between 4 and 10
        const length = Math.random() * 20 + 10; // Length between 10 and 30
        const yChange = (Math.random() - 0.5) * 8; // Y change
        const newY = Math.max(-5, Math.min(12, lastYRef.current + yChange));
        
        // Sometimes same color, sometimes swap
        const lastColor = visiblePlatforms[visiblePlatforms.length - 1]?.color ?? 0;
        const colorSwapChance = 0.5;
        const nextColor = Math.random() < colorSwapChance ? (lastColor === 0 ? 1 : 0) : lastColor;

        const xPos = lastXRef.current + gap + length / 2;
        
        visiblePlatforms.push({
          id: platformIdCounter++,
          x: xPos,
          y: newY,
          length,
          color: nextColor,
        });

        lastXRef.current = xPos + length / 2;
        lastYRef.current = newY;

        // Optionally increase score as we generate platforms
        useGameStore.getState().incScore(10);
        useGameStore.getState().incSpeed();
      }

      return visiblePlatforms;
    });
  });

  return (
    <>
      {platforms.map((p) => (
        <Platform key={p.id} def={p} />
      ))}
    </>
  );
}

function Platform({ def }: { def: PlatformDef }) {
  const depth = 4;
  return (
    <RigidBody
      type="fixed"
      position={[def.x, def.y - 1, 0]} // -1 so y is the top surface roughly
      friction={0}
      restitution={0}
      userData={{ color: def.color }}
    >
      <mesh receiveShadow castShadow>
        <boxGeometry args={[def.length, 2, depth]} />
        <meshStandardMaterial color={COLORS[def.color]} roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Decorative inner elements or borders to look nice */}
      <mesh position={[0, 0, depth/2 + 0.05]}>
         <planeGeometry args={[def.length, 2]} />
         <meshBasicMaterial color={COLORS[def.color]} opacity={0.6} transparent />
      </mesh>
    </RigidBody>
  );
}
