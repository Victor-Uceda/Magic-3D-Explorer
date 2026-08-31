import React, { useState } from 'react';
import { CheckCircle2, DollarSign, RotateCcw, Trophy, PlusCircle, Check, Layers } from 'lucide-react';
import { formatPricePEN } from '../../utils/pricing';
import type { BoosterPack, BoosterCard } from '../../services/boosterSimulator';
import type { Card } from '../../types/card';

interface BoosterSummaryModalProps {
  pack: BoosterPack;
  selectedSetName: string;
  bestPull?: BoosterCard;
  onResetNewPack: () => void;
  onBackToViewer: () => void;
  onInspectCardInViewer: (card: Card) => void;
  onAddToDeck?: (card: Card) => void;
  onAddAllToDeck?: (cards: Card[]) => void;
}

export const BoosterSummaryModal: React.FC<BoosterSummaryModalProps> = ({
  pack,
  selectedSetName,
  bestPull,
  onResetNewPack,
  onBackToViewer,
  onInspectCardInViewer,
  onAddToDeck,
  onAddAllToDeck,
}) => {
  const [addedCardIds, setAddedCardIds] = useState<Set<string>>(new Set());
  const [allAdded, setAllAdded] = useState(false);

  const handleAddSingleCard = (e: React.MouseEvent, card: Card) => {
    e.stopPropagation();
    if (onAddToDeck) {
      onAddToDeck(card);
      setAddedCardIds((prev) => new Set(prev).add(card.id));
    }
  };

  const handleAddAllCards = () => {
    if (onAddAllToDeck) {
      const cards = pack.cards.map((c) => c.card);
      onAddAllToDeck(cards);
      setAllAdded(true);
      const allIds = new Set(pack.cards.map((c) => c.card.id));
      setAddedCardIds(allIds);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        background: 'rgba(10, 12, 16, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        overflowY: 'auto',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Header Summary Banner */}
      <div
        style={{
          maxWidth: '1050px',
          width: '100%',
          margin: '0 auto 1.25rem auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          paddingBottom: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9' }}>
              Sobre Abierto: {selectedSetName}
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            15 cartas obtenidas • Haz clic en cualquier carta para examinarla en 3D
          </span>
        </div>

        {/* Total Estimated Value Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '0.45rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <DollarSign size={16} color="#cbd5e1" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>VALOR TOTAL ESTIMADO</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f8fafc' }}>
                ${pack.totalValueUsd.toFixed(2)} USD <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>({formatPricePEN(pack.totalValueUsd)})</span>
              </span>
            </div>
          </div>

          {/* Add All Cards to Deck */}
          {onAddAllToDeck && (
            <button
              type="button"
              onClick={handleAddAllCards}
              disabled={allAdded}
              style={{
                background: allAdded ? 'rgba(16, 185, 129, 0.2)' : 'var(--accent-gold)',
                color: allAdded ? '#10b981' : '#0f172a',
                border: allAdded ? '1px solid #10b981' : 'none',
                borderRadius: '9999px',
                padding: '0.55rem 1.15rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: allAdded ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
              title="Añadir todas las 15 cartas de este sobre al mazo activo"
            >
              {allAdded ? <Check size={14} /> : <Layers size={14} />}
              <span>{allAdded ? '¡Sobre Añadido al Mazo!' : 'Añadir Todo al Mazo'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetNewPack}
            style={{
              background: '#1e2434',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '9999px',
              padding: '0.55rem 1.1rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <RotateCcw size={14} />
            <span>Otro Sobre</span>
          </button>

          <button
            type="button"
            onClick={onBackToViewer}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '9999px',
              padding: '0.55rem 1.1rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Volver
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          maxWidth: '1050px',
          width: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem',
          paddingBottom: '2rem',
        }}
      >
        {pack.cards.map((item, idx) => {
          const penVal = formatPricePEN(item.card.prices.usd);
          const imgUrl = item.card.imageUris.normal || item.card.imageUris.small;
          const isBest = bestPull?.card.id === item.card.id;
          const isAdded = addedCardIds.has(item.card.id);

          return (
            <div
              key={`${item.card.id}-${idx}`}
              onClick={() => onInspectCardInViewer(item.card)}
              style={{
                background: 'rgba(15, 17, 23, 0.65)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${isBest ? 'rgba(217, 119, 6, 0.6)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '12px',
                padding: '0.55rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.18s ease',
              }}
              title="Haz clic para ver esta carta en 3D"
            >
              {isBest && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#d97706',
                    color: '#ffffff',
                    borderRadius: '4px',
                    padding: '0.15rem 0.4rem',
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    zIndex: 2,
                  }}
                >
                  <Trophy size={11} />
                  <span>TOP PULL</span>
                </div>
              )}

              <img
                src={imgUrl}
                alt={item.card.name}
                style={{
                  width: '100%',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                  aspectRatio: '5/7',
                  objectFit: 'cover',
                }}
                loading="lazy"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color:
                        item.rarity === 'mythic'
                          ? '#d97706'
                          : item.rarity === 'rare'
                          ? '#c5a059'
                          : item.rarity === 'uncommon'
                          ? '#94a3b8'
                          : '#64748b',
                    }}
                  >
                    {item.rarity}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {penVal}
                  </span>
                </div>

                <p style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f1f5f9', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.card.name}
                </p>

                {/* Add single card to deck button */}
                {onAddToDeck && (
                  <button
                    type="button"
                    onClick={(e) => handleAddSingleCard(e, item.card)}
                    style={{
                      marginTop: '0.2rem',
                      background: isAdded ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                      border: `1px solid ${isAdded ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: isAdded ? '#10b981' : '#f1f5f9',
                      borderRadius: '6px',
                      padding: '0.25rem 0.4rem',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.15s ease',
                    }}
                    title="Añadir esta carta a tu mazo activo"
                  >
                    {isAdded ? <Check size={12} /> : <PlusCircle size={12} />}
                    <span>{isAdded ? 'Añadida' : '+ Al Mazo'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoosterSummaryModal;
