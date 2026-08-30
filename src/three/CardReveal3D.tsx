import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Card } from '../types/card';

// Official high-res Magic: The Gathering Card Back URL
const OFFICIAL_MTG_CARD_BACK_URL = 'https://backs.scryfall.io/large/5/9/597b79b3-7d77-4261-871a-60dd17403388.jpg';

const textureCache = new Map<string, THREE.Texture>();

function getCardBackTexture(): THREE.Texture {
  if (textureCache.has('__mtg_official_back__')) {
    return textureCache.get('__mtg_official_back__')!;
  }

  const loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';
  const texture = loader.load(
    OFFICIAL_MTG_CARD_BACK_URL,
    () => {
      texture.needsUpdate = true;
    },
    undefined,
    () => console.warn('Usando reverso procedural como respaldo')
  );

  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('__mtg_official_back__', texture);
  return texture;
}

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
    ctx.fillStyle = '#0f1013';
    ctx.fillRect(0, 0, 512, 716);

    const frameGrad = ctx.createLinearGradient(0, 0, 512, 716);
    frameGrad.addColorStop(0, '#262a33');
    frameGrad.addColorStop(1, '#16181d');
    ctx.fillStyle = frameGrad;
    ctx.fillRect(20, 20, 472, 676);

    ctx.fillStyle = '#16181d';
    ctx.fillRect(32, 32, 448, 44);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(32, 32, 448, 44);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(name, 44, 62);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

// Creates authentic MTG card shape with smooth rounded corners
function createRoundedCardShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + h - r);
  shape.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + h);
  shape.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  shape.absarc(x + r, y + r, r, Math.PI, (3 * Math.PI) / 2, false);

  return shape;
}

// Generates UV coordinates for front or back rounded face without distortion
function createCardFaceGeometry(w: number, h: number, r: number): THREE.BufferGeometry {
  const shape = createRoundedCardShape(w, h, r);
  const geom = new THREE.ShapeGeometry(shape, 32);

  const pos = geom.attributes.position;
  const uvs = new Float32Array(pos.count * 2);

  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const u = (px + w / 2) / w;
    const v = (py + h / 2) / h;
    uvs[i * 2] = u;
    uvs[i * 2 + 1] = v;
  }

  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  return geom;
}

// Generates black cardstock core edge geometry with rounded corners
function createCardCoreGeometry(w: number, h: number, r: number, depth: number): THREE.BufferGeometry {
  const shape = createRoundedCardShape(w, h, r);
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 24,
  });
  geom.center();
  return geom;
}

interface CardReveal3DProps {
  card: Card;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  isRevealed: boolean;
  onReveal?: () => void;
  index: number;
}

export const CardReveal3D: React.FC<CardReveal3DProps> = ({
  card,
  rarity,
  isRevealed,
  onReveal,
  index,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const frontImageUrl = card.imageUris?.normal || card.imageUris?.large || card.imageUris?.small;
  const cardName = card.name || 'Carta';

  // Front Texture with safe caching and fallback
  const [frontTexture, setFrontTexture] = useState<THREE.Texture>(() => {
    if (frontImageUrl && textureCache.has(frontImageUrl)) {
      return textureCache.get(frontImageUrl)!;
    }
    return getFallbackFrontTexture(cardName);
  });

  const backTexture = useMemo(() => getCardBackTexture(), []);

  useEffect(() => {
    if (!frontImageUrl) return;

    if (textureCache.has(frontImageUrl)) {
      setFrontTexture(textureCache.get(frontImageUrl)!);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(
      frontImageUrl,
      (loadedTexture) => {
        loadedTexture.generateMipmaps = true;
        loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.anisotropy = 8;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.needsUpdate = true;
        textureCache.set(frontImageUrl, loadedTexture);
        setFrontTexture(loadedTexture);
      },
      undefined,
      () => {
        console.warn(`No se pudo cargar la imagen frontal: ${frontImageUrl}`);
        setFrontTexture(getFallbackFrontTexture(cardName));
      }
    );
  }, [frontImageUrl, cardName]);

  // Card dimensions (standard MTG 63 x 88 mm aspect ratio)
  const width = 2.15;
  const height = 3.0;
  const radius = 0.09;
  const depth = 0.016;

  const frontGeom = useMemo(() => createCardFaceGeometry(width, height, radius), []);
  const backGeom = useMemo(() => createCardFaceGeometry(width, height, radius), []);
  const coreGeom = useMemo(() => createCardCoreGeometry(width, height, radius, depth), []);

  const pointerDownPos = useRef<{ x: number; y: number; time: number } | null>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    // Face down is Math.PI, revealed is 0
    const targetRotY = isRevealed ? 0 : Math.PI;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.18);

    // Floating breathing motion
    const t = Date.now() * 0.002;
    const hoverLift = hovered ? 0.08 : 0;
    const floatY = Math.sin(t + index * 0.5) * 0.04 + hoverLift;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, floatY, 0.12);

    // Slight tilt to catch light
    const tiltX = Math.cos(t * 0.8) * 0.03;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tiltX, 0.1);
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!pointerDownPos.current) return;
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const dist = Math.hypot(dx, dy);
    const elapsed = Date.now() - pointerDownPos.current.time;
    pointerDownPos.current = null;

    if (dist < 6 && elapsed < 280) {
      e.stopPropagation();
      onReveal?.();
    }
  };

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
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
      {/* Front Face (Illustrated card with clean natural physical lighting) */}
      <mesh geometry={frontGeom} position={[0, 0, depth / 2 + 0.001]}>
        <meshPhysicalMaterial
          map={frontTexture}
          roughness={rarity === 'mythic' ? 0.2 : 0.28}
          metalness={0.0}
          clearcoat={0.3}
          clearcoatRoughness={0.15}
          reflectivity={0.6}
        />
      </mesh>

      {/* Back Face (Standard MTG card back) */}
      <mesh geometry={backGeom} position={[0, 0, -depth / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial map={backTexture} roughness={0.32} metalness={0.0} />
      </mesh>

      {/* Card Core Edge (Dark cardstock layer) */}
      <mesh geometry={coreGeom}>
        <meshStandardMaterial color="#111317" roughness={0.8} metalness={0.0} />
      </mesh>
    </group>
  );
};

export default CardReveal3D;
