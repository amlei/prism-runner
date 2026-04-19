import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, vec3 } from '@react-three/rapier';
import { useGameStore, COLORS } from './store';
import * as THREE from 'three';
import { useKeyboardControls } from '@react-three/drei';

export function Player() {
  const bodyRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { status, gameId, color, speed, switchColor, setStatus } = useGameStore();
  const [jumpsLeft, setJumpsLeft] = useState(2);
  const [subscribeKeys] = useKeyboardControls();

  useEffect(() => {
    if (status === 'start' || status === 'playing') {
      const pos = bodyRef.current?.translation();
      if (status === 'start' || gameId > 0) {
        bodyRef.current?.setTranslation({ x: 0, y: 5, z: 0 }, true);
        bodyRef.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
        setJumpsLeft(2);
      }
    }
  }, [status, gameId]);

  const lookAtTargetRef = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!bodyRef.current) return;
    const pos = bodyRef.current.translation();

    if (status === 'playing') {
      // Scale back to normal if coming from reset
      if (meshRef.current) {
         meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.2);
         const vel = bodyRef.current.linvel();
         bodyRef.current.setLinvel({ x: speed, y: vel.y, z: 0 }, true);

         if (vel.y !== 0) {
           meshRef.current.rotation.z -= delta * 5;
         } else {
           meshRef.current.rotation.z -= delta * speed * 0.5;
         }
      }

      if (pos.y < -10) {
        setStatus('gameover');
      }
    } else if (status === 'gameover') {
      if (meshRef.current) {
        meshRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      }
    }

    const targetCamPos = new THREE.Vector3(pos.x - 12, pos.y + 12, 12);
    const targetLookAt = new THREE.Vector3(pos.x, pos.y, 0);

    if (state.camera.position.distanceTo(targetCamPos) > 30 || lookAtTargetRef.current.lengthSq() === 0) {
       state.camera.position.copy(targetCamPos);
       lookAtTargetRef.current.copy(targetLookAt);
    } else {
       state.camera.position.lerp(targetCamPos, 0.1);
       lookAtTargetRef.current.lerp(targetLookAt, 0.1);
    }
    state.camera.lookAt(lookAtTargetRef.current);
  });

  const handleJump = () => {
    const currentStatus = useGameStore.getState().status;
    if (currentStatus !== 'playing' || jumpsLeft <= 0 || !bodyRef.current) return;
    const vel = bodyRef.current.linvel();
    bodyRef.current.setLinvel({ x: vel.x, y: 14, z: 0 }, true);
    setJumpsLeft((j) => j - 1);
  };

  useEffect(() => {
    const onTouchJump = () => {
      if (useGameStore.getState().status === 'start') {
        setStatus('playing');
      } else {
        handleJump();
      }
    };
    window.addEventListener('touchJump', onTouchJump);

    const unsubJump = subscribeKeys(
      (state) => state.jump,
      (pressed) => {
        if (pressed) {
          if (useGameStore.getState().status === 'start') {
            setStatus('playing');
          } else {
            handleJump();
          }
        }
      }
    );
    const unsubSwitch = subscribeKeys(
      (state) => state.switchColor,
      (pressed) => {
        if (pressed) {
          if (useGameStore.getState().status === 'start') {
            setStatus('playing');
          }
          switchColor();
        }
      }
    );
    return () => {
      window.removeEventListener('touchJump', onTouchJump);
      unsubJump();
      unsubSwitch();
    };
  }, [status, jumpsLeft, switchColor, setStatus, subscribeKeys]);

  const onCollisionEnter = (e: any) => {
    if (status !== 'playing') return;
    
    const platformObject = e.other.rigidBodyObject;
    if (platformObject) {
      const platformColor = platformObject.userData?.color;
      
      if (platformColor !== undefined) {
        // Check color condition
        const currentColor = useGameStore.getState().color;
        if (platformColor !== currentColor) {
          setStatus('gameover');
        } else {
          setJumpsLeft(2);
        }
      }
    }
  };

  return (
    <RigidBody
      ref={bodyRef}
      colliders="cuboid"
      restitution={0}
      friction={0}
      position={[0, 5, 0]}
      enabledRotations={[false, false, false]}
      onCollisionEnter={onCollisionEnter}
      userData={{ type: 'player' }}
      mass={1}
    >
      <mesh castShadow ref={meshRef}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color={COLORS[color]} emissive={COLORS[color]} emissiveIntensity={0.2} />
      </mesh>
    </RigidBody>
  );
}
