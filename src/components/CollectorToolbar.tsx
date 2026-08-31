import React, { useState, useEffect } from 'react';
import { Palette, Zap, Repeat, Sparkles } from 'lucide-react';
import { CardVariantsModal } from './cards/CardVariantsModal';
import type { Card } from '../types/card';
import type { CardFinish } from '../three/Card3D';

interface CollectorToolbarProps {
  currentCard: Card | null;
  currentFinish: CardFinish;
  onChangeFinish: (finish: CardFinish) => void;
  enableParticles?: boolean;
  onToggleParticles?: () => void;
  onSelectPrintVariant: (card: Card) => void;
  isFlipped?: boolean;
  onToggleFlip?: () => void;
}

export const CollectorToolbar: React.FC<CollectorToolbarProps> = ({
  currentCard,
  currentFinish,
  onChangeFinish,
  onSelectPrintVariant,
  isFlipped = false,
  onToggleFlip,
}) => {
  const [isArtModalOpen, setIsArtModalOpen] = useState(false);

  // Keyboard shortcut 'V' to toggle variants modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
      if (isInputActive) return;

      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setIsArtModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!currentCard) return null;

  return (
    <>
      {/* Studio 3D Canvas Stage Dock (Anchored at bottom, never covering the card) */}
      <div className="collector-stage-dock" role="toolbar" aria-label="Acabados y controles de carta">
        {/* Normal Finish Button */}
        <button
          type="button"
          onClick={() => onChangeFinish('normal')}
          className={`dock-finish-btn ${currentFinish === 'normal' ? 'dock-finish-btn-active' : ''}`}
          title="Acabado estándar mate [N]"
        >
          <span className="finish-name">Normal</span>
          <span className="finish-shortcut">N</span>
        </button>

        {/* Foil Finish Button */}
        <button
          type="button"
          onClick={() => onChangeFinish('foil')}
          className={`dock-finish-btn ${currentFinish === 'foil' ? 'dock-finish-btn-active' : ''}`}
          title="Acabado Foil Tradicional con brillo iridiscente [F]"
        >
          <Sparkles size={12} className="finish-icon" />
          <span className="finish-name">Foil</span>
          <span className="finish-shortcut">F</span>
        </button>

        {/* Etched Finish Button */}
        <button
          type="button"
          onClick={() => onChangeFinish('etched')}
          className={`dock-finish-btn ${currentFinish === 'etched' ? 'dock-finish-btn-active' : ''}`}
          title="Acabado Etched Foil metálico grabado [E]"
        >
          <Zap size={12} className="finish-icon" />
          <span className="finish-name">Etched</span>
          <span className="finish-shortcut">E</span>
        </button>

        <div className="dock-separator" />

        {/* Flip 3D Button */}
        {onToggleFlip && (
          <button
            type="button"
            onClick={onToggleFlip}
            className={`dock-tool-btn ${isFlipped ? 'dock-tool-btn-active' : ''}`}
            title="Voltear cara de la carta (Presiona la barra de ESPACIO)"
          >
            <Repeat size={13} />
            <span>Voltear</span>
            <span className="tool-shortcut">ESPACIO</span>
          </button>
        )}

        {/* Art Variants Button */}
        <button
          type="button"
          onClick={() => setIsArtModalOpen(true)}
          className="dock-tool-btn"
          title="Ver impresiones e ilustraciones alternativas [V]"
        >
          <Palette size={13} />
          <span>Variantes</span>
          <span className="tool-shortcut">V</span>
        </button>
      </div>

      {/* Alternative Art Variants Studio Modal */}
      <CardVariantsModal
        isOpen={isArtModalOpen}
        onClose={() => setIsArtModalOpen(false)}
        currentCard={currentCard}
        onSelectVariant={onSelectPrintVariant}
      />
    </>
  );
};

export default CollectorToolbar;
