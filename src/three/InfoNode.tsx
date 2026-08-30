import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export type NodeType = 'PRICE' | 'LEGALITY' | 'PRINTINGS' | 'DETAILS';

export interface InfoNodeProps {
  type: NodeType;
  position: [number, number, number];
  title: string;
  subtitle?: string;
  color: string;
  isSelected?: boolean;
  onClick?: (type: NodeType) => void;
}

export const InfoNode: React.FC<InfoNodeProps> = ({
  type,
  position,
  title,
  subtitle,
  color,
  isSelected = false,
  onClick,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // Offset phase based on position to avoid synchronous bobbing
    const phase = position[0] * 2 + position[1];
    meshRef.current.position.y = position[1] + Math.sin(t * 2 + phase) * 0.08;

    // Pulse scale on select/hover
    const targetScale = isSelected ? 1.25 : hovered ? 1.15 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Central glowing core orb */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(type);
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
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.5 : hovered ? 1.0 : 0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Orbiting wireframe halo */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <ringGeometry args={[0.32, 0.35, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered || isSelected ? 0.9 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point light emitted by the node */}
      <pointLight
        color={color}
        intensity={isSelected ? 2 : hovered ? 1.2 : 0.5}
        distance={3}
      />

      {/* 3D Floating HTML Label Tag */}
      <Html
        position={[0, 0.45, 0]}
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'auto',
          userSelect: 'none',
          cursor: 'pointer',
        }}
      >
        <button
          onClick={() => onClick?.(type)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: isSelected
              ? `linear-gradient(135deg, ${color}cc, rgba(18, 21, 32, 0.95))`
              : 'rgba(18, 21, 32, 0.85)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${isSelected ? color : hovered ? `${color}88` : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '9999px',
            padding: '0.35rem 0.85rem',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: isSelected
              ? `0 0 20px ${color}88`
              : hovered
              ? `0 0 12px ${color}66`
              : '0 4px 12px rgba(0,0,0,0.5)',
            transform: isSelected ? 'scale(1.08)' : hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            whiteSpace: 'nowrap',
            outline: 'none',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span
              style={{
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                lineHeight: 1.1,
              }}
            >
              {title}
            </span>
            {subtitle && (
              <span style={{ fontSize: '0.65rem', color: isSelected ? '#ffffff' : '#94a3b8', lineHeight: 1.1 }}>
                {subtitle}
              </span>
            )}
          </div>
        </button>
      </Html>
    </group>
  );
};

export default InfoNode;
