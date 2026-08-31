import React, { useRef, useMemo, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Card } from '../types/card';

const OFFICIAL_MTG_CARD_BACK_URL = 'https://backs.scryfall.io/large/5/9/597b79b3-7d77-4261-871a-60dd17403388.jpg';

const textureCache = new Map<string, THREE.Texture>();

function getCardTexture(url: string): THREE.Texture {
  if (!url) return getCardBackTexture();
  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';
  const texture = loader.load(url, () => {
    texture.needsUpdate = true;
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(url, texture);
  return texture;
}

function getCardBackTexture(): THREE.Texture {
  return getCardTexture(OFFICIAL_MTG_CARD_BACK_URL);
}

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

function createCardFaceGeometry(w: number, h: number, r: number): THREE.BufferGeometry {
  const shape = createRoundedCardShape(w, h, r);
  const geom = new THREE.ShapeGeometry(shape, 24);
  const pos = geom.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    uvs[i * 2] = (px + w / 2) / w;
    uvs[i * 2 + 1] = (py + h / 2) / h;
  }
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  return geom;
}

interface SingleCascadeCardProps {
  card: Card;
  offset: number;
  totalVisible: number;
  isFrontCard: boolean;
  isSpread: boolean;
  isCascading: boolean;
  onCardClick: () => void;
}

const SingleCascadeCard: React.FC<SingleCascadeCardProps> = ({
  card,
  offset,
  totalVisible,
  isFrontCard,
  isSpread,
  isCascading,
  onCardClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const imgUrl = card?.imageUris?.normal || card?.imageUris?.small || card?.imageUris?.large || '';
  const frontTexture = useMemo(() => getCardTexture(imgUrl), [imgUrl]);
  const backTexture = useMemo(() => getCardBackTexture(), []);

  const cardGeometry = useMemo(() => createCardFaceGeometry(2.5, 3.5, 0.12), []);
  const edgeGeometry = useMemo(() => new THREE.BoxGeometry(2.48, 3.48, 0.02), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let targetRotZ = 0;

    if (isSpread) {
      // Abanico 3D centrado en la carta activa (offset 0)
      const spacing = totalVisible <= 3 ? 1.65 : totalVisible <= 7 ? 1.25 : Math.max(0.65, 12 / totalVisible);
      targetX = offset * spacing;

      if (isFrontCard) {
        // Carta activa: elevada al frente y en el centro
        targetY = 0.32;
        targetZ = 0.95;
        targetRotX = 0.06;
        targetRotY = 0;
        targetRotZ = 0;

        if (hovered) {
          targetY = 0.48;
          targetZ = 1.25;
        }
      } else {
        // Cartas laterales: curvadas suavemente hacia atrás en profundidad
        const absOffset = Math.abs(offset);
        targetY = -absOffset * 0.05 - Math.pow(offset * 0.12, 2) * 0.12;
        targetZ = -absOffset * 0.32;
        targetRotX = 0.08;
        targetRotY = -offset * 0.07;
        targetRotZ = -offset * 0.045;

        if (hovered) {
          targetY += 0.22;
          targetZ += 0.35;
        }
      }

      if (isCascading) {
        const wavePhase = time * 2.6 + offset * 0.35;
        const waveAmpY = isFrontCard ? 0.1 : 0.16;
        targetY += Math.sin(wavePhase) * waveAmpY;
        targetZ += Math.cos(wavePhase) * 0.08;
        targetRotZ += Math.sin(wavePhase) * 0.025;
      }
    } else {
      // Pila de mazo 3D (Solitario): La carta activa (offset 0) está en la cima
      if (isFrontCard) {
        targetX = 0;
        targetY = 0;
        targetZ = 0.5;
        targetRotX = 0;
        targetRotY = 0;
        targetRotZ = 0;

        if (hovered) {
          targetY = 0.25;
          targetZ = 0.95;
        }
      } else {
        // Cartas en la pila debajo de la activa
        const depth = Math.min(offset, 25);
        targetX = Math.sin(depth * 0.45) * 0.06;
        targetY = -depth * 0.01;
        targetZ = -depth * 0.07;
        targetRotX = 0;
        targetRotY = 0;
        targetRotZ = (depth % 2 === 0 ? 1 : -1) * 0.018;
      }
    }

    const lerpSpeed = isFrontCard ? 14 : 9;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * lerpSpeed);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * lerpSpeed);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * lerpSpeed);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * lerpSpeed);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * lerpSpeed);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, delta * lerpSpeed);
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onCardClick();
  };

  const scaleValue = isFrontCard
    ? (hovered ? 1.09 : 1.05)
    : (hovered ? 1.03 : 0.98);

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      scale={[scaleValue, scaleValue, scaleValue]}
    >
      {/* Front Face */}
      <mesh geometry={cardGeometry} position={[0, 0, 0.011]}>
        <meshStandardMaterial
          map={frontTexture}
          roughness={isFrontCard ? 0.2 : 0.3}
          metalness={0.15}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Back Face */}
      <mesh geometry={cardGeometry} position={[0, 0, -0.011]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial
          map={backTexture}
          roughness={0.35}
          metalness={0.1}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Core Card Edge */}
      <mesh geometry={edgeGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={isFrontCard ? '#d4af37' : '#0f1013'}
          roughness={isFrontCard ? 0.4 : 0.7}
          metalness={isFrontCard ? 0.3 : 0}
        />
      </mesh>
    </group>
  );
};

interface DeckCascade3DProps {
  cards: Card[];
  activeCardIndex: number;
  isCascading: boolean;
  isSpread: boolean;
  onCycleNext: () => void;
  onSelectCardDirect: (index: number) => void;
}

export const DeckCascade3D: React.FC<DeckCascade3DProps> = ({
  cards,
  activeCardIndex,
  isCascading,
  isSpread,
  onCycleNext,
  onSelectCardDirect,
}) => {
  const total = cards.length;

  // Calculamos las cartas a renderizar centrando en la carta activa
  const displayCards = useMemo(() => {
    if (total === 0) return [];

    if (isSpread) {
      // Modo Abanico: Centrado en activeCardIndex (offset 0)
      const maxCount = Math.min(total, 17);
      const half = Math.floor(maxCount / 2);
      const items: Array<{
        card: Card;
        offset: number;
        actualIndex: number;
        sortZ: number;
      }> = [];

      for (let o = -half; o <= half; o++) {
        if (maxCount < total || (o >= -Math.floor((total - 1) / 2) && o <= Math.ceil((total - 1) / 2))) {
          const actualIndex = ((activeCardIndex + o) % total + total) % total;
          const card = cards[actualIndex];
          if (card) {
            // sortZ: menor Z se dibuja primero; la carta activa (offset 0) tiene el mayor sortZ y se dibuja al final
            const sortZ = o === 0 ? 999 : -Math.abs(o);
            items.push({ card, offset: o, actualIndex, sortZ });
          }
        }
      }

      // Ordenar de menor sortZ a mayor sortZ para que el render respete capas y la carta activa quede siempre al frente
      return items.sort((a, b) => a.sortZ - b.sortZ);
    } else {
      // Modo Pila (Solitario): La carta activa está en offset 0 (cima), las siguientes debajo
      const displayCount = Math.min(total, 25);
      const items: Array<{
        card: Card;
        offset: number;
        actualIndex: number;
        sortZ: number;
      }> = [];

      for (let i = 0; i < displayCount; i++) {
        const actualIndex = (activeCardIndex + i) % total;
        const card = cards[actualIndex];
        if (card) {
          const sortZ = i === 0 ? 999 : -i;
          items.push({ card, offset: i, actualIndex, sortZ });
        }
      }

      return items.sort((a, b) => a.sortZ - b.sortZ);
    }
  }, [cards, activeCardIndex, isSpread, total]);

  if (total === 0) return null;

  return (
    <group position={[0, 0, 0]}>
      {displayCards.map((item) => (
        <SingleCascadeCard
          key={`${item.card.id}-${item.actualIndex}-${item.offset}`}
          card={item.card}
          offset={item.offset}
          totalVisible={displayCards.length}
          isFrontCard={item.offset === 0}
          isSpread={isSpread}
          isCascading={isCascading}
          onCardClick={() => {
            if (item.offset === 0 || !isSpread) {
              onCycleNext();
            } else {
              onSelectCardDirect(item.actualIndex);
            }
          }}
        />
      ))}
    </group>
  );
};

export default DeckCascade3D;
