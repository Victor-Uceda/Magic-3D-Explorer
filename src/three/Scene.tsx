import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import Lighting from './Lighting';
import CameraController from './CameraController';
import Card3D, { CardFinish } from './Card3D';
import ManaParticles from './ManaParticles';
import { getManaAuraColor } from '../utils/manaColors';
import type { Card } from '../types/card';

export interface SceneProps {
  card?: Card | null;
  autoRotate?: boolean;
  resetCameraTrigger?: number;
  isFlipped?: boolean;
  finish?: CardFinish;
  enableParticles?: boolean;
  onToggleFlip?: () => void;
}

export const Scene: React.FC<SceneProps> = ({
  card,
  autoRotate = false,
  resetCameraTrigger = 0,
  isFlipped = false,
  finish = 'normal',
  enableParticles = false,
  onToggleFlip,
}) => {
  const frontImageUrl = card?.imageUris?.normal || card?.imageUris?.large || card?.imageUris?.png;
  const backImageUrl = card?.backImageUri;
  const cardName = card?.name || 'Sol Ring';

  // Dynamic Mana Aura calculated from card's mana colors
  const manaAuraColor = useMemo(
    () => getManaAuraColor(card?.colors || card?.colorIdentity),
    [card?.colors, card?.colorIdentity]
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `radial-gradient(ellipse 75% 65% at 50% 45%, ${manaAuraColor}25 0%, rgba(11, 14, 20, 0.72) 50%, rgba(7, 9, 13, 0.95) 100%), url(/sanctum_bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Canvas
        shadows={false} // Rendimiento óptimo sin recálculos pesados de sombras
        dpr={[1, 1.5]} // Límite de DPR para fluidez total
        camera={{ position: [0, 0.6, 5.4], fov: 44 }}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <Suspense fallback={null}>
          {/* Dynamic Scene Lighting */}
          <Lighting manaAuraColor={manaAuraColor} />

          {/* Ambient Ethereal Mana Particles */}
          {enableParticles && <ManaParticles color={manaAuraColor} count={50} />}

          {/* Clean 3D Card Model with Dynamic Finish (Normal / Foil / Etched) */}
          <Card3D
            frontImageUrl={frontImageUrl}
            backImageUrl={backImageUrl}
            name={cardName}
            isFloating={true}
            isFlipped={isFlipped}
            finish={finish}
            onCardClick={onToggleFlip}
          />

          {/* Smooth Orbit Controls */}
          <CameraController
            autoRotate={autoRotate}
            resetTrigger={resetCameraTrigger}
            minDistance={3.0}
            maxDistance={9.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
