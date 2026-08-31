import React from 'react';

interface TableProps {
  position?: [number, number, number];
  ringColor?: string;
}

export const Table: React.FC<TableProps> = ({
  position = [0, -2.2, 0],
  ringColor = '#b8964e',
}) => {
  return (
    <group position={position}>
      {/* Pedestal base de pizarra oscura */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[4.8, 5.0, 0.4, 36]} />
        <meshStandardMaterial
          color="#16181d"
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* Anillo de incrustación temática de maná */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[3.2, 3.25, 48]} />
        <meshStandardMaterial
          color={ringColor}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Almohadilla central del pedestal */}
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
