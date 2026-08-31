import React from 'react';
import { Layers, Trash2 } from 'lucide-react';
import type { DeckItem } from '../../pages/DeckBuilderPage';

interface DeckSidebarProps {
  decks: DeckItem[];
  activeDeckId: string | null;
  onSelectDeck: (id: string) => void;
  onDeleteDeck: (id: string) => void;
}

export const DeckSidebar: React.FC<DeckSidebarProps> = ({
  decks,
  activeDeckId,
  onSelectDeck,
  onDeleteDeck,
}) => {
  return (
    <aside className="decks-sidebar">
      <h3 className="decks-sidebar-title">
        <Layers size={14} />
        <span>Mis Mazos ({decks.length})</span>
      </h3>

      <div className="decks-list">
        {decks.map((deck) => {
          const count = deck.cards.reduce((sum, c) => sum + c.quantity, 0);
          const isActive = deck.id === activeDeckId;
          return (
            <div
              key={deck.id}
              onClick={() => onSelectDeck(deck.id)}
              className={`deck-sidebar-item ${isActive ? 'deck-sidebar-item-active' : ''}`}
            >
              <div className="deck-item-top">
                <h4>{deck.name}</h4>
                <span className="deck-item-format">{deck.format.toUpperCase()}</span>
              </div>
              <div className="deck-item-bottom">
                <span>{count} cartas</span>
                {decks.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDeck(deck.id);
                    }}
                    className="deck-delete-btn"
                    title="Eliminar mazo"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
