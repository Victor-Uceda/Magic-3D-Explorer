/**
 * Modelo 3D de Carta Magic: The Gathering (Card3D.tsx)
 * 
 * Conceptos Clave de Gráficos 3D Implementados:
 * 1. Geometría Paramétrica MTG: Genera la forma con esquinas redondeadas auténticas y extrusión física.
 * 2. Mapeo UV Frontal y Posterior: Proyecta texturas en ambas caras sin invertir o espejar el texto.
 * 3. Patrón Strategy en Acabados de Materiales (PBR):
 *    - Normal: MeshStandardMaterial clásico con rugosidad equilibrada.
 *    - Foil: MeshPhysicalMaterial con capa de iridiscencia espectral (140-500nm).
 *    - Etched: MeshPhysicalMaterial con micro-grabado y alta reflectividad metálica.
 * 4. Animación en Frame Loop (useFrame): Interpolación suave (Lerp) para rotación, flotación y volteo 3D.
 * 5. Caché Global de Texturas: Reutiliza texturas WebGL para evitar pausas por Garbage Collection.
 */

import React, { useRef, useState, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { CARD_DIMENSIONS, ANIMATION_CONSTANTS, TEXTURE_URLS } from '../constants/card3D';

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

// Caché global de texturas para evitar pausas por Garbage Collection en búsquedas
const textureCache = new Map<string, THREE.Texture>();

// Carga y obtención de la textura de reverso de la carta
function getCardBackTexture(): THREE.Texture {
  if (textureCache.has('__mtg_official_back__')) {
    return textureCache.get('__mtg_official_back__')!;
  }

  const loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';
  const texture = loader.load(
    TEXTURE_URLS.OFFICIAL_MTG_CARD_BACK,
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

// Generador procedural de respaldo para el anverso de la carta
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
    ctx.strokeStyle = '#b8964e';
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

    ctx.fillStyle = '#b8964e';
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

// Crea la forma geométrica auténtica de carta MTG con esquinas redondeadas
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

// Genera coordenadas UV mapeadas para las caras frontal y posterior
function createCardFaceGeometry(w: number, h: number, r: number): THREE.BufferGeometry {
  const shape = createRoundedCardShape(w, h, r);
  const geom = new THREE.ShapeGeometry(shape, 32);

  const pos = geom.attributes.position;
  const uvs = new Float32Array(pos.count * 2);

  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    // Mapeo UV de izquierda a derecha (la rotación Y del mesh maneja el reverso sin espejar el texto)
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

  // Carga la textura frontal con almacenamiento en caché
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

  // Carga la textura trasera (segunda cara para cartas DFC o reverso por defecto)
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

  // Geometrías redondeadas para carta MTG
  const { frontGeom, backGeom, edgeGeom } = useMemo(() => {
    const w = CARD_DIMENSIONS.WIDTH;
    const h = CARD_DIMENSIONS.HEIGHT;
    const r = CARD_DIMENSIONS.CORNER_RADIUS;
    const shape = createRoundedCardShape(w, h, r);
    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: CARD_DIMENSIONS.DEPTH,
      bevelEnabled: false,
    });
    extrude.center();

    return {
      frontGeom: createCardFaceGeometry(w, h, r),
      backGeom: createCardFaceGeometry(w, h, r),
      edgeGeom: extrude,
    };
  }, []);

  // Animación de flotación y volteo 3D suave
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    if (isFloating) {
      groupRef.current.position.y =
        Math.sin(t * ANIMATION_CONSTANTS.FLOAT_FREQUENCY) * ANIMATION_CONSTANTS.FLOAT_AMPLITUDE + 0.15;

      const baseFlipRotation = isFlipped ? Math.PI : 0;
      const wobble = Math.sin(t * 0.7) * 0.08 + (hovered ? 0.18 : 0);
      const targetRotY = baseFlipRotation + (isFlipped ? -wobble : wobble);

      // Transición suave e interactiva del volteo
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        ANIMATION_CONSTANTS.ROTATION_LERP_SPEED
      );
      groupRef.current.rotation.z = Math.cos(t * 1.1) * 0.02;
    }

    const targetScale = hovered ? 1.05 : 1.0;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      ANIMATION_CONSTANTS.SCALE_LERP_SPEED
    );
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

    // Solo voltea si fue un clic rápido y estático, no un arrastre de cámara orbital
    if (dist < 6 && elapsed < 280) {
      e.stopPropagation();
      onCardClick?.();
    }
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Grupo principal de la carta 3D */}
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
        {/* Cara frontal con esquinas redondeadas y acabado dinámico (Normal, Foil, Etched) */}
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

        {/* Cara posterior con esquinas redondeadas (rotada 180 grados) */}
        <mesh geometry={backGeom} position={[0, 0, -0.009]} rotation={[0, Math.PI, 0]}>
          <meshStandardMaterial
            map={backTexture}
            roughness={0.26}
            metalness={0.0}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Borde y núcleo oscuro de la carta */}
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
