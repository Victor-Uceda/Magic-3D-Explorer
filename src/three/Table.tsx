import React from 'react';

interface TableProps {
  position?: [number, number, number];
  color?: string;
}

export const Table: React.FC<TableProps> = ({
  position = [0, -2.2, 0],
  color = '#121520',
}) => {
  return (
    <group position={position}>
      {/* Base platform cylinder receiving shadows */}
      <mesh receiveShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[5, 5.2, 0.4, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Glowing inner runic ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[3.2, 3.28, 64]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Outer arcane ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[4.4, 4.45, 64]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Center pedestal anchor */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.1, 48]} />
        <meshStandardMaterial
          color="#1b2030"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
};

export default Table;
