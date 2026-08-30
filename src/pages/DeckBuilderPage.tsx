import React, { useState } from 'react';
import {
  Plus,
  Layers,
  Trash2,
  Play,
  Box,
  Compass,
} from 'lucide-react';
import type { Card } from '../types/card';
import type { AppRoute } from '../types/navigation';

export interface DeckItem {
  id: string;
  name: string;
  format: string;
  description: string;
  cards: Array<{ card: Card; quantity: number }>;
  createdAt: number;
}

interface DeckBuilderPageProps {
  decks: DeckItem[];
  onCreateDeck: (name: string, format: string) => void;
  onDeleteDeck: (id: string) => void;
  onInspectCard: (card: Card) => void;
  onNavigate: (route: AppRoute) => void;
}

export const DeckBuilderPage: React.FC<DeckBuilderPageProps> = ({
  decks,
  onCreateDeck,
  onDeleteDeck,
  onInspectCard,
  onNavigate,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckFormat, setDeckFormat] = useState('commander');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(decks[0]?.id || null);

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) return;
    onCreateDeck(deckName.trim(), deckFormat);
    setDeckName('');
    setIsCreating(false);
  };

  const totalCardsInActiveDeck = activeDeck
    ? activeDeck.cards.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  return (
    <div className="page-container deck-builder-page">
      {/* Header Bar */}
      <div className="deck-page-header">
        <div>
          <h1 className="deck-page-title">Constructor de Mazos</h1>
          <p className="deck-page-subtitle">
            Crea estrategias, organiza tus listas y visualiza su estructura.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="create-deck-btn"
        >
          <Plus size={15} />
          <span>Nuevo Mazo</span>
        </button>
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="modal-backdrop" onClick={() => setIsCreating(false)}>
          <div className="deck-form-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Crear Nuevo Mazo</h3>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label htmlFor="deckNameInput">Nombre del Mazo</label>
                <input
                  id="deckNameInput"
                  type="text"
                  placeholder="ej. Control Azorius, Dragones..."
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="deckFormatSelect">Formato</label>
                <select
                  id="deckFormatSelect"
                  value={deckFormat}
                  onChange={(e) => setDeckFormat(e.target.value)}
                >
                  <option value="commander">Commander / EDH (100 cartas)</option>
                  <option value="modern">Modern (60 cartas)</option>
                  <option value="standard">Standard (60 cartas)</option>
                  <option value="pioneer">Pioneer (60 cartas)</option>
                  <option value="pauper">Pauper (60 cartas)</option>
                  <option value="legacy">Legacy (60 cartas)</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Guardar Mazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="deck-page-layout">
        {/* Left: Decks List */}
        <aside className="decks-sidebar">
          <h3 className="decks-sidebar-title">
            <Layers size={14} />
            <span>Mis Mazos ({decks.length})</span>
          </h3>

          <div className="decks-list">
            {decks.map((deck) => {
              const cardCount = deck.cards.reduce((sum, c) => sum + c.quantity, 0);
              const isActive = deck.id === activeDeck?.id;
              return (
                <div
                  key={deck.id}
                  onClick={() => setActiveDeckId(deck.id)}
                  className={`deck-sidebar-item ${isActive ? 'deck-sidebar-item-active' : ''}`}
                >
                  <div className="deck-item-top">
                    <h4>{deck.name}</h4>
                    <span className="deck-item-format">{deck.format.toUpperCase()}</span>
                  </div>
                  <div className="deck-item-bottom">
                    <span>{cardCount} cartas</span>
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
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right: Active Deck Details */}
        <main className="deck-main-panel">
          {activeDeck ? (
            <div className="active-deck-view">
              <div className="active-deck-header">
                <div>
                  <div className="deck-title-row">
                    <h2>{activeDeck.name}</h2>
                    <span className="deck-format-badge">{activeDeck.format.toUpperCase()}</span>
                  </div>
                  <span className="deck-count-indicator">
                    {totalCardsInActiveDeck} cartas en la lista
                  </span>
                </div>

                <div className="deck-action-buttons">
                  <button
                    type="button"
                    onClick={() => onNavigate('catalog')}
                    className="deck-btn-secondary"
                  >
                    <Compass size={14} />
                    <span>Explorar Cartas</span>
                  </button>

                  <button
                    type="button"
                    className="deck-btn-primary"
                    title="Visualizar este mazo en 3D"
                    onClick={() => {
                      if (activeDeck.cards.length > 0) {
                        onInspectCard(activeDeck.cards[0].card);
                      }
                    }}
                  >
                    <Box size={14} />
                    <span>Ver en 3D</span>
                  </button>

                  <button
                    type="button"
                    className="deck-btn-secondary"
                    title="Simulador de mano"
                  >
                    <Play size={14} />
                    <span>Simular Mano</span>
                  </button>
                </div>
              </div>

              {/* Cards in Deck Grid */}
              {activeDeck.cards.length === 0 ? (
                <div className="deck-empty-state">
                  <Layers size={36} color="var(--text-muted)" />
                  <h3>El mazo no tiene cartas</h3>
                  <p>Explora el catálogo y agrega cartas para empezar a armar tu lista.</p>
                  <button
                    type="button"
                    onClick={() => onNavigate('catalog')}
                    className="btn-primary-action"
                  >
                    <Compass size={14} />
                    <span>Ir al Catálogo</span>
                  </button>
                </div>
              ) : (
                <div className="deck-cards-list-grid">
                  {activeDeck.cards.map((entry) => (
                    <div
                      key={entry.card.id}
                      className="deck-card-chip"
                      onClick={() => onInspectCard(entry.card)}
                    >
                      <img
                        src={entry.card.imageUris.small || entry.card.imageUris.normal}
                        alt={entry.card.name}
                        className="deck-card-thumb"
                      />
                      <div className="deck-card-info">
                        <span className="deck-card-qty">{entry.quantity}x</span>
                        <span className="deck-card-title">{entry.card.name}</span>
                      </div>
                      <span className="deck-card-type">{entry.card.typeLine.split('—')[0]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="deck-empty-state">
              <Layers size={36} color="var(--text-muted)" />
              <h3>Ningún mazo seleccionado</h3>
              <p>Crea un mazo para empezar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
