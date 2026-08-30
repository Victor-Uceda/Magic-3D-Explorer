import React from 'react';

interface TableProps {
  position?: [number, number, number];
  ringColor?: string;
}

export const Table: React.FC<TableProps> = ({
  position = [0, -2.2, 0],
  ringColor = '#d4af37',
}) => {
  return (
    <group position={position}>
      {/* Dark Slate Base Pedestal */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[4.8, 5.0, 0.4, 36]} />
        <meshStandardMaterial
          color="#16181d"
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* Mana-Themed Inlay Ring (Refined Collector Style) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[3.2, 3.25, 48]} />
        <meshStandardMaterial
          color={ringColor}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Inner Pedestal Pad */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.5, 1.55, 0.08, 32]} />
        <meshStandardMaterial
          color="#1c1f26"
          roughness={0.5}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
};

export default Table;
