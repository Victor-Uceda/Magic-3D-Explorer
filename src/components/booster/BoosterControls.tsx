import React from 'react';
import { ArrowLeft, ArrowRight, Repeat } from 'lucide-react';
import { formatPricePEN } from '../../utils/pricing';
import type { BoosterPack, BoosterCard } from '../../services/boosterSimulator';

interface BoosterControlsProps {
  pack: BoosterPack;
  currentIndex: number;
  revealedIndices: Set<number>;
  currentBoosterCard: BoosterCard;
  onJumpToCard: (idx: number) => void;
  onPrevCard: () => void;
  onNextCard: () => void;
  onToggleCardFlip: () => void;
  onRevealAll: () => void;
}

export const BoosterControls: React.FC<BoosterControlsProps> = ({
  pack,
  currentIndex,
  revealedIndices,
  currentBoosterCard,
  onJumpToCard,
  onPrevCard,
  onNextCard,
  onToggleCardFlip,
  onRevealAll,
}) => {
  const currentCardRarity = currentBoosterCard.rarity || 'common';
  const pen = formatPricePEN(currentBoosterCard.card.prices.usd);

  return (
    <>
      {/* Top Card Progress Dots */}
      <div className="booster-dots-container">
        {pack.cards.map((c, i) => {
          const isCurrent = i === currentIndex;
          const isRev = revealedIndices.has(i);
          const dotColor =
            c.rarity === 'mythic'
              ? '#d97706'
              : c.rarity === 'rare'
              ? '#c5a059'
              : c.rarity === 'uncommon'
              ? '#94a3b8'
              : '#475569';

          return (
            <div
              key={i}
              onClick={() => onJumpToCard(i)}
              style={{
                width: isCurrent ? '18px' : '7px',
                height: '7px',
                borderRadius: '9999px',
                background: isCurrent ? '#f1f5f9' : isRev ? dotColor : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={`Carta ${i + 1}: ${c.card.name} (${c.rarity})`}
            />
          );
        })}
      </div>

      {/* Right Floating Card Details */}
      <div className="booster-card-details-floating">
        <div className="booster-details-card-inner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color:
                  currentCardRarity === 'mythic'
                    ? '#d97706'
                    : currentCardRarity === 'rare'
                    ? '#c5a059'
                    : currentCardRarity === 'uncommon'
                    ? '#94a3b8'
                    : '#cbd5e1',
              }}
            >
              {currentCardRarity.toUpperCase()}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f1f5f9' }}>
              {pen}
            </span>
          </div>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.3 }}>
            {currentBoosterCard.card.name}
          </h4>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
            {currentBoosterCard.card.typeLine}
          </p>
        </div>
      </div>

      {/* Bottom Dock */}
      <div className="booster-controls-dock">
        {/* Previous Card Button */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={onPrevCard}
            className="booster-ctrl-btn"
          >
            <ArrowLeft size={14} />
            <span>Anterior</span>
          </button>
        )}

        {/* Flip Card Button */}
        <button
          type="button"
          onClick={onToggleCardFlip}
          className="booster-ctrl-btn"
          title="Voltear carta"
        >
          <Repeat size={14} />
          <span>Voltear</span>
        </button>

        {/* Next / Finish Button */}
        <button
          type="button"
          onClick={onNextCard}
          className="booster-ctrl-btn booster-ctrl-btn-primary"
        >
          <span>{currentIndex + 1 === 15 ? 'Resumen' : `Siguiente (${currentIndex + 1}/15)`}</span>
          <ArrowRight size={15} />
        </button>

        {/* Instant Reveal All Button */}
        <button
          type="button"
          onClick={onRevealAll}
          className="booster-ctrl-btn booster-ctrl-btn-ghost"
        >
          Ver Todo
        </button>
      </div>
    </>
  );
};

export default BoosterControls;

