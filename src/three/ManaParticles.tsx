import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PARTICLE_CONSTANTS } from '../constants/card3D';

interface ManaParticlesProps {
  color?: string;
  count?: number;
}

export const ManaParticles: React.FC<ManaParticlesProps> = ({
  color = '#b8964e',
  count = PARTICLE_CONSTANTS.DEFAULT_COUNT,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribución cilíndrica alrededor de la carta
      const radius = PARTICLE_CONSTANTS.RADIUS_MIN + Math.random() * PARTICLE_CONSTANTS.RADIUS_RANGE;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * PARTICLE_CONSTANTS.VERTICAL_RANGE;

      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * radius;

      // Velocidad suave de flotación
      spd[i * 3] = (Math.random() - 0.5) * PARTICLE_CONSTANTS.LATERAL_SPEED_RANGE;
      spd[i * 3 + 1] = PARTICLE_CONSTANTS.DRIFT_SPEED_MIN + Math.random() * PARTICLE_CONSTANTS.DRIFT_SPEED_RANGE;
      spd[i * 3 + 2] = (Math.random() - 0.5) * PARTICLE_CONSTANTS.LATERAL_SPEED_RANGE;
    }

    return [pos, spd];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Movimiento vertical hacia arriba
      array[i * 3 + 1] += speeds[i * 3 + 1] * delta;

      // Oscilación suave
      array[i * 3] += Math.sin(array[i * 3 + 1] * 2) * PARTICLE_CONSTANTS.OSCILLATION_INTENSITY;
      array[i * 3 + 2] += Math.cos(array[i * 3 + 1] * 2) * PARTICLE_CONSTANTS.OSCILLATION_INTENSITY;

      // Reubicar cuando exceda los límites verticales
      if (array[i * 3 + 1] > PARTICLE_CONSTANTS.VERTICAL_LIMIT) {
        array[i * 3 + 1] = -PARTICLE_CONSTANTS.VERTICAL_LIMIT;
      }
    }

    posAttr.needsUpdate = true;
  });

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={PARTICLE_CONSTANTS.POINT_SIZE}
        color={color}
        map={particleTexture}
        transparent
        opacity={PARTICLE_CONSTANTS.OPACITY}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ManaParticles;
