import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import Lighting from './Lighting';
import CameraController from './CameraController';
import Card3D, { CardFinish } from './Card3D';
import ManaParticles from './ManaParticles';
import { getManaAuraColor } from '../utils/manaColors';
import { PARTICLE_CONSTANTS } from '../constants/card3D';
import { useResponsive } from '../hooks/useMediaQuery';
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

  // Aura de maná dinámica calculada a partir de los colores de la carta
  const manaAuraColor = useMemo(
    () => getManaAuraColor(card?.colors || card?.colorIdentity),
    [card?.colors, card?.colorIdentity]
  );

  // Partículas y cámara adaptativas según el tamaño de pantalla (zoom reducido en mobile)
  const { isMobile, isTablet } = useResponsive();
  const particleCount = isMobile ? PARTICLE_CONSTANTS.MOBILE_COUNT : PARTICLE_CONSTANTS.DEFAULT_COUNT;

  // Cámara optimizada: en PC 6.2, en tablets 7.2, en mobile 8.2 para zoom cómodo sin recortes
  const cameraPosition: [number, number, number] = useMemo(() => {
    if (isMobile) return [0, 0.3, 8.2];
    if (isTablet) return [0, 0.4, 7.2];
    return [0, 0.5, 6.2];
  }, [isMobile, isTablet]);

  const cameraFov = useMemo(() => {
    if (isMobile) return 45;
    return 42;
  }, [isMobile]);

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
        camera={{ position: cameraPosition, fov: cameraFov }}
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
          {/* Iluminación dinámica de la escena */}
          <Lighting manaAuraColor={manaAuraColor} />

          {/* Partículas ambientales de maná etéreo */}
          {enableParticles && <ManaParticles color={manaAuraColor} count={particleCount} />}

          {/* Modelo 3D de la carta con acabado interactivo (Normal / Foil / Etched) */}
          <Card3D
            frontImageUrl={frontImageUrl}
            backImageUrl={backImageUrl}
            name={cardName}
            isFloating={true}
            isFlipped={isFlipped}
            finish={finish}
            onCardClick={onToggleFlip}
          />

          {/* Controles de cámara orbitales suaves */}
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
