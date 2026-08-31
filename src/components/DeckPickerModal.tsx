import React, { useState } from 'react';
import { Layers, PlusCircle, Check, X, Sparkles } from 'lucide-react';
import type { Card } from '../types/card';

export interface DeckPickerDeck {
  id: string;
  name: string;
  format: string;
  cardCount: number;
}

interface DeckPickerModalProps {
  /** The card(s) pending to be added */
  pendingCards: Card[];
  /** Available decks to choose from */
  decks: DeckPickerDeck[];
  /** Called when the user picks a deck */
  onSelectDeck: (deckId: string) => void;
  /** Called when the user wants to create a new deck and add there */
  onCreateNewDeck?: () => void;
  /** Called to close the modal without adding */
  onClose: () => void;
}

export const DeckPickerModal: React.FC<DeckPickerModalProps> = ({
  pendingCards,
  decks,
  onSelectDeck,
  onCreateNewDeck,
  onClose,
}) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(
    decks.length > 0 ? decks[0].id : null
  );
  const [justAdded, setJustAdded] = useState(false);

  const isBulk = pendingCards.length > 1;
  const cardLabel = isBulk
    ? `${pendingCards.length} cartas`
    : `"${pendingCards[0]?.name}"`;

  const handleConfirm = () => {
    if (!selectedDeckId) return;
    setJustAdded(true);
    setTimeout(() => {
      onSelectDeck(selectedDeckId);
    }, 350);
  };

  return (
    <div
      className="deck-picker-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="deck-picker-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="deck-picker-header">
          <div className="deck-picker-header-left">
            <Layers size={18} color="var(--accent-gold)" />
            <div>
              <h3 className="deck-picker-title">Añadir al Mazo</h3>
              <span className="deck-picker-subtitle">
                {isBulk ? (
                  <>Selecciona el mazo para <strong>{cardLabel}</strong></>
                ) : (
                  <>¿A cuál mazo agregar {cardLabel}?</>
                )}
              </span>
            </div>
          </div>
          <button type="button" className="deck-picker-close" onClick={onClose} title="Cancelar">
            <X size={16} />
          </button>
        </div>

        {/* Card preview strip (for single card) */}
        {!isBulk && pendingCards[0]?.imageUris?.small && (
          <div className="deck-picker-card-preview">
            <img
              src={pendingCards[0].imageUris.small}
              alt={pendingCards[0].name}
              className="deck-picker-card-img"
            />
            <div className="deck-picker-card-info">
              <span className="deck-picker-card-name">{pendingCards[0].name}</span>
              <span className="deck-picker-card-type">{pendingCards[0].typeLine}</span>
            </div>
          </div>
        )}

        {/* Deck list */}
        <div className="deck-picker-list">
          {decks.map((deck) => {
            const isSelected = selectedDeckId === deck.id;
            return (
              <button
                key={deck.id}
                type="button"
                className={`deck-picker-item ${isSelected ? 'deck-picker-item-selected' : ''}`}
                onClick={() => setSelectedDeckId(deck.id)}
              >
                <div className="deck-picker-item-left">
                  <div className={`deck-picker-radio ${isSelected ? 'deck-picker-radio-active' : ''}`}>
                    {isSelected && <Check size={10} />}
                  </div>
                  <div className="deck-picker-item-info">
                    <span className="deck-picker-item-name">{deck.name}</span>
                    <span className="deck-picker-item-meta">
                      {deck.format.toUpperCase()} • {deck.cardCount} cartas
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <Sparkles size={14} color="var(--accent-gold)" />
                )}
              </button>
            );
          })}

          {/* Create new deck option */}
          {onCreateNewDeck && (
            <button
              type="button"
              className="deck-picker-item deck-picker-item-new"
              onClick={onCreateNewDeck}
            >
              <div className="deck-picker-item-left">
                <PlusCircle size={16} color="#64748b" />
                <span className="deck-picker-item-name" style={{ color: '#94a3b8' }}>
                  Crear nuevo mazo…
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Footer actions */}
        <div className="deck-picker-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-submit"
            disabled={!selectedDeckId || justAdded}
            onClick={handleConfirm}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {justAdded ? <Check size={14} /> : <PlusCircle size={14} />}
            <span>{justAdded ? '¡Añadida!' : isBulk ? 'Añadir Todas' : 'Añadir al Mazo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
