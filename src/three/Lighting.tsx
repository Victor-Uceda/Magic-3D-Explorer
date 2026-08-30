import React from 'react';

interface LightingProps {
  manaAuraColor?: string;
}

// manaAuraColor retained in props for API compatibility but no longer used for a point light
export const Lighting: React.FC<LightingProps> = () => {
  return (
    <>
      {/* Bright clear ambient lighting */}
      <ambientLight intensity={1.4} color="#ffffff" />

      {/* Main front key light directly illuminating the card face */}
      <directionalLight position={[0, 4, 6]} intensity={1.8} color="#ffffff" />

      {/* Back key light illuminating the back face when flipped or rotated */}
      <directionalLight position={[0, 4, -6]} intensity={1.6} color="#ffffff" />

      {/* Left and Right soft rim fill lights */}
      <directionalLight position={[-5, 2, 0]} intensity={0.7} color="#f8fafc" />
      <directionalLight position={[5, 2, 0]} intensity={0.7} color="#f8fafc" />
    </>
  );
};

export default Lighting;
