import { useEffect } from 'react';
import type { CardFinish } from '../three/Card3D';

interface UseGlobalHotkeysOptions {
  isCardRoute: boolean;
  toggleFlipped: () => void;
  setCardFinish: React.Dispatch<React.SetStateAction<CardFinish>>;
  toggleAutoRotate: () => void;
  toggleHotkeyModal: () => void;
}

export function useGlobalHotkeys({
  isCardRoute,
  toggleFlipped,
  setCardFinish,
  toggleAutoRotate,
  toggleHotkeyModal,
}: UseGlobalHotkeysOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive =
        activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
      if (isInputActive) return;

      if (e.code === 'Space' && isCardRoute) {
        e.preventDefault();
        toggleFlipped();
      } else if ((e.key === 'f' || e.key === 'F') && isCardRoute) {
        setCardFinish((prev) => (prev === 'foil' ? 'normal' : 'foil'));
      } else if ((e.key === 'e' || e.key === 'E') && isCardRoute) {
        setCardFinish((prev) => (prev === 'etched' ? 'normal' : 'etched'));
      } else if ((e.key === 'n' || e.key === 'N') && isCardRoute) {
        setCardFinish('normal');
      } else if ((e.key === 'r' || e.key === 'R') && isCardRoute) {
        toggleAutoRotate();
      } else if (e.key === '?') {
        toggleHotkeyModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCardRoute, setCardFinish, toggleAutoRotate, toggleFlipped, toggleHotkeyModal]);
}
