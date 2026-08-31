import React from 'react';
import { Layers, Compass, MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import { ManaCost } from '../ManaCost';
import { formatPricePEN } from '../../utils/pricing';
import type { Card } from '../../types/card';
import type { DeckItem } from '../../pages/DeckBuilderPage';

interface GroupedCategory {
  key: string;
  label: string;
  items: DeckItem['cards'];
  count: number;
}

interface DeckCardListProps {
  deckId: string;
  groupedCategories: GroupedCategory[];
  totalCardsCount: number;
  onInspectCard: (card: Card) => void;
  onUpdateQuantity: (deckId: string, cardId: string, delta: number) => void;
  onRemoveCard: (deckId: string, cardId: string) => void;
  onNavigateToCatalog: () => void;
}

export const DeckCardList: React.FC<DeckCardListProps> = ({
  deckId,
  groupedCategories,
  totalCardsCount,
  onInspectCard,
  onUpdateQuantity,
  onRemoveCard,
  onNavigateToCatalog,
}) => {
  if (totalCardsCount === 0) {
    return (
      <div className="deck-empty-state">
        <Layers size={36} color="var(--text-muted)" />
        <h3>El mazo no tiene cartas</h3>
        <p>Explora el catálogo y pulsa "+ Al Mazo" en las cartas que desees incorporar.</p>
        <button type="button" onClick={onNavigateToCatalog} className="btn-primary-action">
          <Compass size={14} />
          <span>Ir al Catálogo</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {groupedCategories.map((group) => (
        <div key={group.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {/* Category Header Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.2rem 0',
            }}
          >
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {group.label}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--accent-gold)',
                background: 'rgba(197, 160, 89, 0.1)',
                padding: '0.08rem 0.4rem',
                borderRadius: '10px',
              }}
            >
              {group.count}
            </span>
          </div>

          {/* Cards List */}
          <div className="deck-cards-list-grid">
            {group.items.map((entry) => {
              const unitPricePen = formatPricePEN(entry.card.prices.usd);
              return (
                <div key={entry.card.id} className="deck-card-chip">
                  <img
                    src={entry.card.imageUris.small || entry.card.imageUris.normal}
                    alt={entry.card.name}
                    className="deck-card-thumb"
                    onClick={() => onInspectCard(entry.card)}
                    title="Examinar carta en 3D"
                  />

                  <div className="deck-card-info" onClick={() => onInspectCard(entry.card)}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <span className="deck-card-title" title={entry.card.name}>
                        {entry.card.name}
                      </span>
                      {entry.card.manaCost && <ManaCost manaCost={entry.card.manaCost} size={13} />}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span>{unitPricePen}</span>
                      <span
                        className={`rarity-tag rarity-tag-${entry.card.rarity}`}
                        style={{ padding: '0.05rem 0.3rem', fontSize: '0.58rem' }}
                      >
                        {entry.card.rarity.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(deckId, entry.card.id, -1)}
                      className="deck-btn-secondary"
                      style={{ padding: '0.25rem 0.35rem' }}
                      title="Disminuir cantidad"
                    >
                      <MinusCircle size={13} />
                    </button>

                    <span
                      style={{
                        minWidth: '22px',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {entry.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(deckId, entry.card.id, 1)}
                      className="deck-btn-secondary"
                      style={{ padding: '0.25rem 0.35rem' }}
                      title="Aumentar cantidad"
                    >
                      <PlusCircle size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveCard(deckId, entry.card.id)}
                      className="deck-btn-secondary"
                      style={{ padding: '0.25rem 0.35rem', color: '#f87171', marginLeft: '0.15rem' }}
                      title="Eliminar carta del mazo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
