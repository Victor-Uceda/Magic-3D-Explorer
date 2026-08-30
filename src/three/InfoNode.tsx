import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export type NodeType = 'PRECIO' | 'LEGALIDAD' | 'EDICIONES' | 'DETALLES';

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
    const phase = position[0] * 1.5 + position[1];
    meshRef.current.position.y = position[1] + Math.sin(t * 1.5 + phase) * 0.05;

    const targetScale = isSelected ? 1.18 : hovered ? 1.08 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Polished Metallic/Stone Orb */}
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
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>

      {/* Outer Fine Ring */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <ringGeometry args={[0.26, 0.28, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.85 : hovered ? 0.6 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating HTML Label Tag (Spanish, Minimalist, Classic MTG Palette) */}
      <Html
        position={[0, 0.4, 0]}
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
            background: isSelected ? 'rgba(31, 34, 41, 0.95)' : 'rgba(22, 24, 29, 0.9)',
            backdropFilter: 'blur(10px)',
            border: isSelected
              ? `1.5px solid ${color}`
              : hovered
              ? `1px solid ${color}`
              : '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '9999px',
            padding: '0.35rem 0.75rem',
            color: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: isSelected
              ? '0 6px 18px rgba(0, 0, 0, 0.6)'
              : '0 4px 12px rgba(0, 0, 0, 0.4)',
            transform: isSelected ? 'scale(1.04)' : hovered ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            outline: 'none',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                lineHeight: 1.1,
                color: isSelected ? color : '#f1f5f9',
              }}
            >
              {title}
            </span>
            {subtitle && (
              <span style={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: 1.1 }}>
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
