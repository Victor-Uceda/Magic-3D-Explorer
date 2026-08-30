import React from 'react';

interface LightingProps {
  accentColor?: string;
}

export const Lighting: React.FC<LightingProps> = ({ accentColor = '#6366f1' }) => {
  return (
    <>
      {/* Ambient base lighting for soft visibility */}
      <ambientLight intensity={0.65} />

      {/* Main directional light with soft shadows */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />

      {/* Rim light from behind to highlight card edges */}
      <directionalLight
        position={[-5, 4, -5]}
        intensity={0.6}
        color="#06b6d4"
      />

      {/* Subtle bottom fill light */}
      <pointLight
        position={[0, -2, 2]}
        intensity={0.4}
        color={accentColor}
        distance={10}
      />

      {/* Top accent light */}
      <pointLight
        position={[0, 4, 0]}
        intensity={0.5}
        color="#ffffff"
        distance={8}
      />
    </>
  );
};

export default Lighting;
