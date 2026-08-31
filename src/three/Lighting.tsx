import React from 'react';

interface LightingProps {
  manaAuraColor?: string;
}

// manaAuraColor se conserva en las props por compatibilidad de API
export const Lighting: React.FC<LightingProps> = () => {
  return (
    <>
      {/* Iluminación ambiental clara y uniforme */}
      <ambientLight intensity={1.4} color="#ffffff" />

      {/* Luz principal frontal directa que ilumina la cara de la carta */}
      <directionalLight position={[0, 4, 6]} intensity={1.8} color="#ffffff" />

      {/* Luz posterior que ilumina el reverso al girar o voltear la carta */}
      <directionalLight position={[0, 4, -6]} intensity={1.6} color="#ffffff" />

      {/* Luces de relleno laterales suaves (izquierda y derecha) */}
      <directionalLight position={[-5, 2, 0]} intensity={0.7} color="#f8fafc" />
      <directionalLight position={[5, 2, 0]} intensity={0.7} color="#f8fafc" />
    </>
  );
};

export default Lighting;
