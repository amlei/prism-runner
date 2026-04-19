import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls, Environment, Sky } from '@react-three/drei';
import { Player } from './Player';
import { PlatformManager } from './PlatformManager';

const keyboardMap = [
  { name: 'jump', keys: ['ArrowUp', 'Space', 'KeyW', 'KeyD'] },
  { name: 'switchColor', keys: ['ShiftLeft', 'ShiftRight', 'KeyA', 'ArrowLeft'] },
];

export function Game() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas shadows camera={{ position: [-10, 15, 15], fov: 45 }}>
        <color attach="background" args={['#87CEEB']} />
        
        {/* Environment & Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-camera-left={-20} 
          shadow-camera-right={20} 
          shadow-camera-top={20} 
          shadow-camera-bottom={-20} 
        />
        
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="city" />

        <Physics gravity={[0, -30, 0]}>
          <Player />
          <PlatformManager />
        </Physics>
      </Canvas>
    </KeyboardControls>
  );
}
