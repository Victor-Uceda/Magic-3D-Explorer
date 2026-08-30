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
  autoRotateSpeed = 1.8,
  minDistance = 2.0,
  maxDistance = 14,
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
      dampingFactor={0.06}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={Math.PI * 0.95} // Full downward viewing angle (almost 180°)
      minPolarAngle={0.08}           // Full upward top-down viewing angle
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      makeDefault
    />
  );
};

export default CameraController;
