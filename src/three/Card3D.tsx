import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Card3DProps {
  frontImageUrl?: string;
  name?: string;
  isFloating?: boolean;
  onCardClick?: () => void;
  accentColor?: string;
}

// Global Texture Cache to prevent GC pauses on card searches
const textureCache = new Map<string, THREE.Texture>();

// Procedural Card Back Texture
function getCardBackTexture(): THREE.Texture {
  if (textureCache.has('__mtg_back__')) {
    return textureCache.get('__mtg_back__')!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 716;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Dark border
    ctx.fillStyle = '#18100a';
    ctx.fillRect(0, 0, 512, 716);

    // Inner frame
    ctx.fillStyle = '#382214';
    ctx.fillRect(18, 18, 476, 680);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 716);
    bgGrad.addColorStop(0, '#2a180d');
    bgGrad.addColorStop(0.5, '#442b1a');
    bgGrad.addColorStop(1, '#1b0e06');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(32, 32, 448, 652);

    // Center oval
    ctx.strokeStyle = '#c49a3c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(256, 358, 160, 230, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner oval fill
    const ovalGrad = ctx.createRadialGradient(256, 358, 20, 256, 358, 190);
    ovalGrad.addColorStop(0, '#162e44');
    ovalGrad.addColorStop(1, '#09131d');
    ctx.fillStyle = ovalGrad;
    ctx.fill();

    // Mana orbs
    const manaColors = ['#f8e7b9', '#0e68ab', '#150b00', '#d3202a', '#00733e'];
    manaColors.forEach((color, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = 256 + Math.cos(angle) * 65;
      const y = 358 + Math.sin(angle) * 65;
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.fillStyle = '#e2c56a';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAGIC 3D', 256, 230);
    ctx.font = 'italic 16px serif';
    ctx.fillText('THE GATHERING', 256, 490);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('__mtg_back__', texture);
  return texture;
}

// Procedural Card Front Fallback
function getFallbackFrontTexture(name: string): THREE.Texture {
  const cacheKey = `__fallback_${name}__`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 716;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#08090c';
    ctx.fillRect(0, 0, 512, 716);

    const frameGrad = ctx.createLinearGradient(0, 0, 512, 716);
    frameGrad.addColorStop(0, '#1e293b');
    frameGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = frameGrad;
    ctx.fillRect(20, 20, 472, 676);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(32, 32, 448, 44);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(32, 32, 448, 44);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(name, 44, 62);

    const artGrad = ctx.createRadialGradient(256, 220, 20, 256, 220, 160);
    artGrad.addColorStop(0, '#312e81');
    artGrad.addColorStop(1, '#020617');
    ctx.fillStyle = artGrad;
    ctx.fillRect(32, 84, 448, 250);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ MAGIC 3D EXPLORER ✨', 256, 225);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(32, 342, 448, 34);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Artifact • Rare', 44, 365);

    ctx.fillStyle = '#020617';
    ctx.fillRect(32, 384, 448, 240);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px serif';
    ctx.fillText('Explora el universo de Magic en 3D.', 44, 420);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

export const Card3D: React.FC<Card3DProps> = ({
  frontImageUrl,
  name = 'Black Lotus',
  isFloating = true,
  onCardClick,
  accentColor = '#06b6d4',
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const cardBackTexture = useMemo(() => getCardBackTexture(), []);
  const fallbackFrontTexture = useMemo(() => getFallbackFrontTexture(name), [name]);

  // Load external image with texture caching
  const frontTexture = useMemo(() => {
    if (!frontImageUrl) return fallbackFrontTexture;

    if (textureCache.has(frontImageUrl)) {
      return textureCache.get(frontImageUrl)!;
    }

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const tex = loader.load(
      frontImageUrl,
      () => {
        tex.needsUpdate = true;
      },
      undefined,
      () => console.warn('Could not load card texture, using fallback')
    );
    tex.colorSpace = THREE.SRGBColorSpace;
    textureCache.set(frontImageUrl, tex);
    return tex;
  }, [frontImageUrl, fallbackFrontTexture]);

  // Reusable materials
  const materials = useMemo(() => {
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: '#0a0d14',
      roughness: 0.9,
      metalness: 0.1,
    });

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: 0.35,
      metalness: 0.1,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: cardBackTexture,
      roughness: 0.45,
      metalness: 0.1,
    });

    return [edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial, frontMaterial, backMaterial];
  }, [frontTexture, cardBackTexture]);

  // Floating animation with reduced math complexity
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    if (isFloating) {
      meshRef.current.position.y = Math.sin(t * 1.5) * 0.08 + 0.15;
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        Math.sin(t * 0.7) * 0.12 + (hovered ? 0.25 : 0),
        0.06
      );
      meshRef.current.rotation.z = Math.cos(t * 1.1) * 0.02;
    }

    const targetScale = hovered ? 1.05 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh
        ref={meshRef}
        material={materials}
        onClick={(e) => {
          e.stopPropagation();
          onCardClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[2.5, 3.5, 0.022]} />
      </mesh>

      <pointLight
        position={[0, 0, -0.15]}
        intensity={hovered ? 1.2 : 0.6}
        color={accentColor}
        distance={3.5}
      />
    </group>
  );
};

export default Card3D;
