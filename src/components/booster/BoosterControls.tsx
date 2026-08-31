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
      <div
        style={{
          position: 'absolute',
          top: '4.6rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          zIndex: 35,
          background: 'rgba(15, 17, 23, 0.6)',
          backdropFilter: 'blur(8px)',
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
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
      <div
        style={{
          position: 'absolute',
          top: '7.5rem',
          right: '1.5rem',
          width: '260px',
          zIndex: 35,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div
          style={{
            background: 'rgba(15, 17, 23, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '0.75rem 0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
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
      <div
        style={{
          position: 'absolute',
          bottom: '1.75rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 35,
          background: 'rgba(15, 17, 23, 0.75)',
          backdropFilter: 'blur(10px)',
          padding: '0.45rem 0.75rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Previous Card Button */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={onPrevCard}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              borderRadius: '9999px',
              padding: '0.45rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={14} />
            <span>Anterior</span>
          </button>
        )}

        {/* Flip Card Button */}
        <button
          type="button"
          onClick={onToggleCardFlip}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            borderRadius: '9999px',
            padding: '0.45rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.15s ease',
          }}
          title="Voltear carta"
        >
          <Repeat size={14} />
          <span>Voltear</span>
        </button>

        {/* Next / Finish Button */}
        <button
          type="button"
          onClick={onNextCard}
          style={{
            background: '#1e2434',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '9999px',
            padding: '0.5rem 1.25rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>{currentIndex + 1 === 15 ? 'Ver Resumen Final' : `Siguiente (${currentIndex + 1}/15)`}</span>
          <ArrowRight size={15} />
        </button>

        {/* Instant Reveal All Button */}
        <button
          type="button"
          onClick={onRevealAll}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#94a3b8',
            borderRadius: '9999px',
            padding: '0.45rem 0.75rem',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Ver Todo
        </button>
      </div>
    </>
  );
};

export default BoosterControls;
