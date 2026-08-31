import React, { useRef, useMemo, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Card } from '../types/card';

const OFFICIAL_MTG_CARD_BACK_URL = 'https://backs.scryfall.io/large/5/9/597b79b3-7d77-4261-871a-60dd17403388.jpg';

const textureCache = new Map<string, THREE.Texture>();

function getCardTexture(url: string): THREE.Texture {
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
  relativeIndex: number;
  total: number;
  isFrontCard: boolean;
  isSpread: boolean;
  isCascading: boolean;
  onCardClick: () => void;
}

const SingleCascadeCard: React.FC<SingleCascadeCardProps> = ({
  card,
  relativeIndex,
  total,
  isFrontCard,
  isSpread,
  isCascading,
  onCardClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const frontTexture = useMemo(
    () => getCardTexture(card.imageUris.normal || card.imageUris.small),
    [card]
  );
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
      // Abanico en cascada fluido
      const progress = total > 1 ? relativeIndex / (total - 1) : 0;
      const spreadWidth = Math.min(total * 0.35, 14);
      targetX = (progress - 0.5) * spreadWidth;
      targetY = Math.sin(progress * Math.PI) * 0.6 - (relativeIndex * 0.01);
      targetZ = -Math.cos(progress * Math.PI) * 1.5 - (relativeIndex * 0.04);
      targetRotX = 0.1;
      targetRotY = (progress - 0.5) * -0.35;
      targetRotZ = (progress - 0.5) * -0.2;

      if (isCascading) {
        const wavePhase = time * 2.5 - relativeIndex * 0.22;
        targetY += Math.sin(wavePhase) * 0.3;
        targetZ += Math.cos(wavePhase) * 0.2;
        targetRotZ += Math.sin(wavePhase) * 0.06;
      }
    } else {
      // Pila de mazo 3D interactiva (Solitario): La carta activa está de frente
      if (isFrontCard) {
        targetX = 0;
        targetY = 0;
        targetZ = 0.5;
        targetRotX = 0;
        targetRotY = 0;
        targetRotZ = 0;

        if (hovered) {
          targetY = 0.2;
          targetZ = 0.9;
        }
      } else {
        // Cartas en la pila detrás de la frontal
        const depthIdx = Math.min(relativeIndex, 25);
        targetX = Math.sin(depthIdx * 0.4) * 0.08;
        targetY = depthIdx * 0.02;
        targetZ = -depthIdx * 0.12;
        targetRotX = 0;
        targetRotY = 0;
        targetRotZ = (depthIdx % 2 === 0 ? 1 : -1) * 0.02;
      }
    }

    const lerpSpeed = isFrontCard ? 14 : 8;
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

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      scale={hovered && isFrontCard ? [1.06, 1.06, 1.06] : [1, 1, 1]}
    >
      {/* Front Face */}
      <mesh geometry={cardGeometry} position={[0, 0, 0.011]}>
        <meshStandardMaterial
          map={frontTexture}
          roughness={0.25}
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
        <meshStandardMaterial color="#0f1013" roughness={0.7} />
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
  // Límite de 40 cartas para rendering 60 FPS
  const total = cards.length;
  const displayCount = Math.min(total, 40);

  // Ordenar cartas para que la activa esté al frente (relative index 0)
  const orderedCards = useMemo(() => {
    const list: Array<{ card: Card; relativeIndex: number; originalIndex: number }> = [];
    for (let i = 0; i < displayCount; i++) {
      const origIdx = (activeCardIndex + i) % total;
      list.push({
        card: cards[origIdx],
        relativeIndex: i,
        originalIndex: origIdx,
      });
    }
    // Renderizar de atrás hacia adelante para que el z-index de Three.js respete transparencias
    return list.reverse();
  }, [cards, activeCardIndex, total, displayCount]);

  return (
    <group position={[0, 0, 0]}>
      {orderedCards.map((item) => (
        <SingleCascadeCard
          key={`${item.card.id}-${item.originalIndex}`}
          card={item.card}
          relativeIndex={item.relativeIndex}
          total={displayCount}
          isFrontCard={item.relativeIndex === 0}
          isSpread={isSpread}
          isCascading={isCascading}
          onCardClick={() => {
            if (item.relativeIndex === 0 || !isSpread) {
              onCycleNext();
            } else {
              onSelectCardDirect(item.originalIndex);
            }
          }}
        />
      ))}
    </group>
  );
};

export default DeckCascade3D;
