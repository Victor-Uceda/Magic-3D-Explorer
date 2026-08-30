import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BoosterPack3DProps {
  setName: string;
  setCode: string;
  isOpening: boolean;
  isOpen: boolean;
  onClick?: () => void;
}

export const BoosterPack3D: React.FC<BoosterPack3DProps> = ({
  setName,
  setCode,
  isOpening,
  isOpen,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const topFlapRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);
  const animTimeRef = useRef(0);

  // Generate dynamic canvas texture for the booster pack wrapper
  const packTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Rich dark charcoal / graphite metallic foil background
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 768);
    bgGrad.addColorStop(0, '#111317');
    bgGrad.addColorStop(0.3, '#1c1f26');
    bgGrad.addColorStop(0.5, '#282d38');
    bgGrad.addColorStop(0.7, '#1c1f26');
    bgGrad.addColorStop(1, '#0e1014');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 768);

    // Top & Bottom crimped foil stripes
    ctx.fillStyle = '#cbd5e1';
    for (let x = 0; x < 512; x += 12) {
      ctx.fillRect(x, 0, 6, 45);
      ctx.fillRect(x, 723, 6, 45);
    }

    // Platinum / gold borders and frame
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 55, 472, 658);

    // Diagonal metallic shine line
    const shineGrad = ctx.createLinearGradient(50, 50, 450, 700);
    shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shineGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.05)');
    shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
    shineGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.05)');
    shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shineGrad;
    ctx.fillRect(20, 55, 472, 658);

    // Magic Header Banner
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.fillText('MAGIC', 256, 120);

    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText('THE GATHERING', 256, 145);

    // Set Name Banner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(30, 310, 452, 130);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 310, 452, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    
    // Multi-line set name if too long
    const words = setName.split(' ');
    if (words.length > 2) {
      const mid = Math.ceil(words.length / 2);
      ctx.fillText(words.slice(0, mid).join(' '), 256, 360);
      ctx.fillText(words.slice(mid).join(' '), 256, 395);
    } else {
      ctx.fillText(setName, 256, 380);
    }

    // Set Code Badge & 15 Cards text
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`DRAFT BOOSTER • 15 CARTAS`, 256, 420);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 18px monospace';
    ctx.fillText(`[${setCode.toUpperCase()}]`, 256, 610);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }, [setName, setCode]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (isOpening) {
      animTimeRef.current += delta * 2.5;

      // Tear top flap off
      if (topFlapRef.current) {
        topFlapRef.current.position.y = THREE.MathUtils.lerp(
          topFlapRef.current.position.y,
          0.8,
          0.1
        );
        topFlapRef.current.rotation.x = THREE.MathUtils.lerp(
          topFlapRef.current.rotation.x,
          -Math.PI * 0.45,
          0.12
        );
        topFlapRef.current.rotation.z = THREE.MathUtils.lerp(
          topFlapRef.current.rotation.z,
          0.3,
          0.1
        );
      }

      // Pack shakes and expands slightly before cards eject
      const shake = Math.sin(animTimeRef.current * 25) * 0.04 * Math.max(0, 1 - animTimeRef.current * 0.5);
      groupRef.current.rotation.z = shake;

      // Burst of interior light
      if (glowLightRef.current) {
        glowLightRef.current.intensity = THREE.MathUtils.lerp(
          glowLightRef.current.intensity,
          6.0,
          0.15
        );
      }
    } else if (!isOpen) {
      // Gentle breathing float animation
      const t = Date.now() * 0.0018;
      groupRef.current.position.y = Math.sin(t) * 0.08;
      groupRef.current.rotation.y = Math.sin(t * 0.7) * 0.12;
      groupRef.current.rotation.x = Math.cos(t * 0.5) * 0.05;
    } else {
      // Once open, pack drops down/fades
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -3.5, 0.08);
      groupRef.current.scale.lerp(new THREE.Vector3(0.5, 0.5, 0.5), 0.08);
    }
  });

  if (!packTexture) return null;

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      onClick={onClick}
      onPointerOver={() => {
        if (!isOpening && !isOpen) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Glow Light Inside Pack */}
      <pointLight ref={glowLightRef} position={[0, 0.5, 0.2]} color="#ffffff" intensity={0} distance={4} />

      {/* Main Lower Booster Body */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.9, 2.5, 0.18]} />
        <meshPhysicalMaterial
          map={packTexture}
          roughness={0.25}
          metalness={0.7}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          reflectivity={0.9}
        />
      </mesh>

      {/* Top Sealable Flap that tears open */}
      <group ref={topFlapRef} position={[0, 1.05, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.9, 0.5, 0.16]} />
          <meshPhysicalMaterial
            map={packTexture}
            roughness={0.25}
            metalness={0.7}
            clearcoat={0.8}
            clearcoatRoughness={0.15}
          />
        </mesh>
      </group>
    </group>
  );
};

export default BoosterPack3D;
