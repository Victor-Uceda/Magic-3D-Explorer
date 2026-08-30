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

// Procedural Card Back Canvas (Classic MTG style aesthetic)
function createCardBackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 716;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Rich dark brown border
    ctx.fillStyle = '#1c110a';
    ctx.fillRect(0, 0, 512, 716);

    // Inner dark wood frame
    ctx.fillStyle = '#3a2618';
    ctx.fillRect(20, 20, 472, 676);

    // Subtle gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 716);
    bgGrad.addColorStop(0, '#2e1c10');
    bgGrad.addColorStop(0.5, '#4a3020');
    bgGrad.addColorStop(1, '#1e120b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(35, 35, 442, 646);

    // Center oval
    ctx.strokeStyle = '#c29b38';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(256, 358, 170, 240, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner oval fill
    const ovalGrad = ctx.createRadialGradient(256, 358, 20, 256, 358, 200);
    ovalGrad.addColorStop(0, '#1a334d');
    ovalGrad.addColorStop(1, '#0b1622');
    ctx.fillStyle = ovalGrad;
    ctx.fill();

    // Runic dots in center (5 colors of mana representation)
    const manaColors = ['#f8e7b9', '#0e68ab', '#150b00', '#d3202a', '#00733e'];
    manaColors.forEach((color, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = 256 + Math.cos(angle) * 70;
      const y = 358 + Math.sin(angle) * 70;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Magic: The Gathering text representation
    ctx.fillStyle = '#e2c56a';
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAGIC 3D', 256, 230);
    ctx.font = 'italic 18px serif';
    ctx.fillText('THE GATHERING', 256, 490);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Card Front Fallback (Black Lotus Arcane Demo Front)
function createCardFrontFallback(name = 'Black Lotus'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 716;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Outer black border
    ctx.fillStyle = '#0a0a0d';
    ctx.fillRect(0, 0, 512, 716);

    // Frame gradient (Artifact / Arcane)
    const frameGrad = ctx.createLinearGradient(0, 0, 512, 716);
    frameGrad.addColorStop(0, '#2d3748');
    frameGrad.addColorStop(1, '#1a202c');
    ctx.fillStyle = frameGrad;
    ctx.fillRect(24, 24, 464, 668);

    // Title Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(36, 36, 440, 48);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, 440, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(name, 48, 68);

    // Mana Cost Circle
    ctx.beginPath();
    ctx.arc(448, 60, 16, 0, 2 * Math.PI);
    ctx.fillStyle = '#475569';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('{0}', 448, 66);

    // Art Box
    const artGrad = ctx.createRadialGradient(256, 230, 30, 256, 230, 180);
    artGrad.addColorStop(0, '#3b0764');
    artGrad.addColorStop(0.5, '#1e1b4b');
    artGrad.addColorStop(1, '#030712');
    ctx.fillStyle = artGrad;
    ctx.fillRect(36, 92, 440, 260);

    // Lotus flower glow artwork
    ctx.beginPath();
    ctx.arc(256, 230, 60, 0, 2 * Math.PI);
    ctx.fillStyle = '#8b5cf6';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(256, 230, 35, 0, 2 * Math.PI);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ 3D HOLO ARTIFACT ✨', 256, 235);

    // Type Line Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(36, 360, 440, 38);
    ctx.strokeRect(36, 360, 440, 38);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Artifact • Rare', 48, 385);

    // Text Box
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(36, 406, 440, 230);
    ctx.strokeRect(36, 406, 440, 230);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px serif';
    ctx.textAlign = 'left';
    ctx.fillText('{T}, Sacrifice Black Lotus:', 52, 445);
    ctx.fillText('Add three mana of any one color.', 52, 475);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 14px serif';
    ctx.fillText('“A relic of power preserved in the digital void.”', 52, 570);

    // Bottom Bar (Artist & Set)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Illus. Christopher Rush • Magic 3D', 48, 665);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
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

  // Textures
  const cardBackTexture = useMemo(() => createCardBackTexture(), []);
  const defaultFrontTexture = useMemo(() => createCardFrontFallback(name), [name]);

  // Load external image texture if provided
  const frontTexture = useMemo(() => {
    if (!frontImageUrl) return defaultFrontTexture;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const tex = loader.load(
      frontImageUrl,
      undefined,
      undefined,
      () => console.warn('Failed to load card front texture, using fallback')
    );
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [frontImageUrl, defaultFrontTexture]);

  // Materials for BoxGeometry (right, left, top, bottom, front, back)
  const materials = useMemo(() => {
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.8,
      metalness: 0.1,
    });

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: 0.35,
      metalness: 0.15,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: cardBackTexture,
      roughness: 0.45,
      metalness: 0.1,
    });

    return [
      edgeMaterial,  // Right
      edgeMaterial,  // Left
      edgeMaterial,  // Top
      edgeMaterial,  // Bottom
      frontMaterial, // Front (+Z)
      backMaterial,  // Back (-Z)
    ];
  }, [frontTexture, cardBackTexture]);

  // Smooth floating animation
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    if (isFloating) {
      // Gentle breathing float
      meshRef.current.position.y = Math.sin(t * 1.5) * 0.12 + 0.2;
      // Gentle tilt sway
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        Math.sin(t * 0.8) * 0.15 + (hovered ? 0.3 : 0),
        0.05
      );
      meshRef.current.rotation.z = Math.cos(t * 1.2) * 0.03;
    }

    // Scale lerp on hover
    const targetScale = hovered ? 1.06 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Physical Card Mesh */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
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
        {/* Magic card proportions: 2.5 width x 3.5 height x 0.02 depth */}
        <boxGeometry args={[2.5, 3.5, 0.025]} />
      </mesh>

      {/* Subtle glowing halo beneath the floating card */}
      <pointLight
        position={[0, 0, -0.2]}
        intensity={hovered ? 1.5 : 0.8}
        color={accentColor}
        distance={4}
      />
    </group>
  );
};

export default Card3D;
