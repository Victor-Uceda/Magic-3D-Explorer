import React, { useRef, useState, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

export type CardFinish = 'normal' | 'foil' | 'etched';

interface Card3DProps {
  frontImageUrl?: string;
  backImageUrl?: string;
  name?: string;
  isFloating?: boolean;
  isFlipped?: boolean;
  finish?: CardFinish;
  onCardClick?: () => void;
  manaAuraColor?: string;
}

// Global Texture Cache to prevent GC pauses on card searches
const textureCache = new Map<string, THREE.Texture>();

// Official high-res Magic: The Gathering Card Back URL
const OFFICIAL_MTG_CARD_BACK_URL = 'https://backs.scryfall.io/large/5/9/597b79b3-7d77-4261-871a-60dd17403388.jpg';

// Procedural / Loaded Card Back Texture
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

    const artGrad = ctx.createRadialGradient(256, 220, 20, 256, 220, 160);
    artGrad.addColorStop(0, '#334155');
    artGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = artGrad;
    ctx.fillRect(32, 84, 448, 250);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ MAGIC 3D EXPLORER ✨', 256, 225);

    ctx.fillStyle = '#1f2229';
    ctx.fillRect(32, 342, 448, 34);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Colección Clásica', 44, 365);

    ctx.fillStyle = '#0f1013';
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

// Generates UV coordinates for front or back rounded face
function createCardFaceGeometry(w: number, h: number, r: number): THREE.BufferGeometry {
  const shape = createRoundedCardShape(w, h, r);
  const geom = new THREE.ShapeGeometry(shape, 32);

  const pos = geom.attributes.position;
  const uvs = new Float32Array(pos.count * 2);

  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    // Left-to-right UV mapping (Mesh Y-rotation handles back positioning without mirroring text)
    const u = (px + w / 2) / w;
    const v = (py + h / 2) / h;
    uvs[i * 2] = u;
    uvs[i * 2 + 1] = v;
  }

  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  return geom;
}

export const Card3D: React.FC<Card3DProps> = ({
  frontImageUrl,
  backImageUrl,
  name = 'Sol Ring',
  isFloating = true,
  isFlipped = false,
  finish = 'normal',
  onCardClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const defaultBackTexture = useMemo(() => getCardBackTexture(), []);
  const fallbackFrontTexture = useMemo(() => getFallbackFrontTexture(name), [name]);

  // Load front image with texture caching
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
      () => console.warn('No se pudo cargar la textura frontal')
    );
    tex.colorSpace = THREE.SRGBColorSpace;
    textureCache.set(frontImageUrl, tex);
    return tex;
  }, [frontImageUrl, fallbackFrontTexture]);

  // Load back image (DFC second face or default card back)
  const backTexture = useMemo(() => {
    if (!backImageUrl) return defaultBackTexture;

    if (textureCache.has(backImageUrl)) {
      return textureCache.get(backImageUrl)!;
    }

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const tex = loader.load(
      backImageUrl,
      () => {
        tex.needsUpdate = true;
      },
      undefined,
      () => console.warn('No se pudo cargar la textura trasera')
    );
    tex.colorSpace = THREE.SRGBColorSpace;
    textureCache.set(backImageUrl, tex);
    return tex;
  }, [backImageUrl, defaultBackTexture]);

  // Rounded MTG Card Geometries (Width: 2.5, Height: 3.5, Radius: 0.12)
  const { frontGeom, backGeom, edgeGeom } = useMemo(() => {
    const w = 2.5;
    const h = 3.5;
    const r = 0.12; // Authentic MTG rounded corner radius
    const shape = createRoundedCardShape(w, h, r);
    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: 0.016,
      bevelEnabled: false,
    });
    extrude.center();

    return {
      frontGeom: createCardFaceGeometry(w, h, r),
      backGeom: createCardFaceGeometry(w, h, r),
      edgeGeom: extrude,
    };
  }, []);

  // Floating & 3D Flip animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    if (isFloating) {
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.08 + 0.15;
      
      const baseFlipRotation = isFlipped ? Math.PI : 0;
      const wobble = Math.sin(t * 0.7) * 0.08 + (hovered ? 0.18 : 0);
      const targetRotY = baseFlipRotation + (isFlipped ? -wobble : wobble);

      // Snappy and smooth 3D flip animation
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.22);
      groupRef.current.rotation.z = Math.cos(t * 1.1) * 0.02;
    }

    const targetScale = hovered ? 1.05 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
  });

  const pointerDownPos = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!pointerDownPos.current) return;
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const dist = Math.hypot(dx, dy);
    const elapsed = Date.now() - pointerDownPos.current.time;
    pointerDownPos.current = null;

    // Only toggle flip if it was a quick stationary click, NOT an orbit drag
    if (dist < 6 && elapsed < 280) {
      e.stopPropagation();
      onCardClick?.();
    }
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Main 3D Rounded Card */}
      <group
        ref={groupRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Front Face with Rounded Corners - Dynamic Finish */}
        <mesh geometry={frontGeom} position={[0, 0, 0.009]}>
          {finish === 'foil' ? (
            <meshPhysicalMaterial
              map={frontTexture}
              roughness={0.12}
              metalness={0.3}
              clearcoat={0.9}
              clearcoatRoughness={0.06}
              iridescence={1.0}
              iridescenceIOR={1.45}
              iridescenceThicknessRange={[140, 500]}
              reflectivity={0.95}
              side={THREE.FrontSide}
            />
          ) : finish === 'etched' ? (
            <meshPhysicalMaterial
              map={frontTexture}
              roughness={0.38}
              metalness={0.7}
              clearcoat={0.35}
              clearcoatRoughness={0.2}
              iridescence={0.4}
              iridescenceIOR={1.2}
              reflectivity={0.65}
              side={THREE.FrontSide}
            />
          ) : (
            <meshStandardMaterial
              map={frontTexture}
              roughness={0.26}
              metalness={0.0}
              side={THREE.FrontSide}
            />
          )}
        </mesh>

        {/* Back Face with Rounded Corners (180 deg) */}
        <mesh geometry={backGeom} position={[0, 0, -0.009]} rotation={[0, Math.PI, 0]}>
          <meshStandardMaterial
            map={backTexture}
            roughness={0.26}
            metalness={0.0}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Dark Card Edge Core */}
        <mesh geometry={edgeGeom} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#111317"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
};

export default Card3D;
