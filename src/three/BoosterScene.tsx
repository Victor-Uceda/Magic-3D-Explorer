import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraController from './CameraController';
import BoosterPack3D from './BoosterPack3D';
import CardReveal3D from './CardReveal3D';
import type { BoosterCard } from '../services/boosterSimulator';

export type BoosterPhase = 'pack-ready' | 'opening' | 'revealing' | 'finished';

interface BoosterSceneProps {
  phase: BoosterPhase;
  setName: string;
  setCode: string;
  cards: BoosterCard[];
  currentIndex: number;
  isCurrentCardRevealed: boolean;
  onOpenPack: () => void;
  onRevealCurrentCard: () => void;
}

export const BoosterScene: React.FC<BoosterSceneProps> = ({
  phase,
  setName,
  setCode,
  cards,
  currentIndex,
  isCurrentCardRevealed,
  onOpenPack,
  onRevealCurrentCard,
}) => {
  const currentBoosterCard = cards[currentIndex];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(ellipse at center, rgba(20, 24, 33, 0.45) 0%, rgba(10, 12, 16, 0.95) 100%), url(/sanctum_bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 60%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.1, 5.2], fov: 42 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          {/* Iluminación de estudio limpia (ambiental y direccional) */}
          <ambientLight intensity={1.3} color="#ffffff" />
          <directionalLight position={[0, 4, 6]} intensity={1.8} color="#ffffff" />
          <directionalLight position={[0, 4, -6]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-5, 2, 0]} intensity={0.7} color="#f8fafc" />
          <directionalLight position={[5, 2, 0]} intensity={0.7} color="#f8fafc" />

          {/* Fase 1 y 2: Paquete de sobre 3D con brillo foil */}
          {(phase === 'pack-ready' || phase === 'opening') && (
            <BoosterPack3D
              setName={setName}
              setCode={setCode}
              isOpening={phase === 'opening'}
              isOpen={false}
              onClick={onOpenPack}
            />
          )}

          {/* Fase 3 y 4: Revelado interactivo de cartas 3D */}
          {(phase === 'revealing' || phase === 'finished') && currentBoosterCard && (
            <CardReveal3D
              key={`${currentBoosterCard.card.id}-${currentIndex}`}
              card={currentBoosterCard.card}
              rarity={currentBoosterCard.rarity}
              isRevealed={isCurrentCardRevealed}
              onReveal={onRevealCurrentCard}
              index={currentIndex}
            />
          )}

          {/* Control orbital de cámara */}
          <CameraController minDistance={3.0} maxDistance={8.5} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default BoosterScene;
