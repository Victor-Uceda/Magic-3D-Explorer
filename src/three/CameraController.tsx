import React, { useRef, useEffect } from 'react';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraControllerProps {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
  resetTrigger?: number;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  autoRotate = false,
  autoRotateSpeed = 0.8,
  minDistance = 3.5,
  maxDistance = 12,
  resetTrigger = 0,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (controlsRef.current && resetTrigger > 0) {
      controlsRef.current.reset();
    }
  }, [resetTrigger]);

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={Math.PI / 1.8} // Prevent going below table plane
      minPolarAngle={Math.PI / 6}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      makeDefault
    />
  );
};

export default CameraController;
