import { useState, useCallback } from 'react';
import type { CardFinish } from '../three/Card3D';

export interface UseStudio3DReturn {
  autoRotate: boolean;
  setAutoRotate: React.Dispatch<React.SetStateAction<boolean>>;
  toggleAutoRotate: () => void;
  resetCameraTrigger: number;
  triggerResetCamera: () => void;
  isFlipped: boolean;
  setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  toggleFlipped: () => void;
  cardFinish: CardFinish;
  setCardFinish: React.Dispatch<React.SetStateAction<CardFinish>>;
  enableParticles: boolean;
  setEnableParticles: React.Dispatch<React.SetStateAction<boolean>>;
  toggleParticles: () => void;
}

export function useStudio3D(): UseStudio3DReturn {
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [resetCameraTrigger, setResetCameraTrigger] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [cardFinish, setCardFinish] = useState<CardFinish>('normal');
  const [enableParticles, setEnableParticles] = useState<boolean>(false);

  const toggleAutoRotate = useCallback(() => {
    setAutoRotate((prev) => !prev);
  }, []);

  const triggerResetCamera = useCallback(() => {
    setResetCameraTrigger((prev) => prev + 1);
  }, []);

  const toggleFlipped = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const toggleParticles = useCallback(() => {
    setEnableParticles((prev) => !prev);
  }, []);

  return {
    autoRotate,
    setAutoRotate,
    toggleAutoRotate,
    resetCameraTrigger,
    triggerResetCamera,
    isFlipped,
    setIsFlipped,
    toggleFlipped,
    cardFinish,
    setCardFinish,
    enableParticles,
    setEnableParticles,
    toggleParticles,
  };
}
