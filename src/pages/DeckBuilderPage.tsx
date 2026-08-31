import React, { useState, useMemo } from 'react';
import { Plus, Compass, Link2, Check, Download, Box } from 'lucide-react';
import { DeckSidebar } from '../components/deck/DeckSidebar';
import { DeckStatsPanel } from '../components/deck/DeckStatsPanel';
import { DeckCardList } from '../components/deck/DeckCardList';
import { DeckCreateModal } from '../components/deck/DeckCreateModal';
import { DeckExportModal } from '../components/deck/DeckExportModal';
import { formatPricePEN } from '../utils/pricing';
import { getDeckShareUrl } from '../utils/sharing';
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
  onUpdateCardQuantity: (deckId: string, cardId: string, delta: number) => void;
  onRemoveCardFromDeck: (deckId: string, cardId: string) => void;
  onInspectCard: (card: Card) => void;
  onNavigate: (route: AppRoute) => void;
  onInspectDeck3D?: (deckId: string) => void;
}

// Categorías canónicas de tipos de cartas MTG
const CARD_TYPE_CATEGORIES = [
  { key: 'creature', label: 'Criaturas', match: (t: string) => t.toLowerCase().includes('creature') },
  { key: 'instant', label: 'Instantáneos', match: (t: string) => t.toLowerCase().includes('instant') },
  { key: 'sorcery', label: 'Conjuros', match: (t: string) => t.toLowerCase().includes('sorcery') },
  { key: 'artifact', label: 'Artefactos', match: (t: string) => t.toLowerCase().includes('artifact') && !t.toLowerCase().includes('creature') },
  { key: 'enchantment', label: 'Encantamientos', match: (t: string) => t.toLowerCase().includes('enchantment') && !t.toLowerCase().includes('creature') },
  { key: 'planeswalker', label: 'Planeswalkers', match: (t: string) => t.toLowerCase().includes('planeswalker') },
  { key: 'land', label: 'Tierras', match: (t: string) => t.toLowerCase().includes('land') },
  { key: 'other', label: 'Otros', match: () => true },
];

export const DeckBuilderPage: React.FC<DeckBuilderPageProps> = ({
  decks,
  onCreateDeck,
  onDeleteDeck,
  onUpdateCardQuantity,
  onRemoveCardFromDeck,
  onInspectCard,
  onNavigate,
  onInspectDeck3D,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCopiedShare, setIsCopiedShare] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(decks[0]?.id || null);

  const activeDeck = useMemo(
    () => decks.find((d) => d.id === activeDeckId) || decks[0] || null,
    [decks, activeDeckId]
  );

  // Totales y valuación del mazo activo
  const totalCardsCount = useMemo(() => {
    if (!activeDeck) return 0;
    return activeDeck.cards.reduce((sum, item) => sum + item.quantity, 0);
  }, [activeDeck]);

  const targetFormatCount = useMemo(() => {
    if (!activeDeck) return 60;
    return activeDeck.format === 'commander' ? 100 : 60;
  }, [activeDeck]);

  const totalDeckValueUSD = useMemo(() => {
    if (!activeDeck) return 0;
    return activeDeck.cards.reduce((sum, item) => {
      const price = item.card.prices.usd ? parseFloat(item.card.prices.usd) : 0;
      return sum + price * item.quantity;
    }, 0);
  }, [activeDeck]);

  const totalDeckValuePEN = formatPricePEN(totalDeckValueUSD.toFixed(2));

  // Enlace directo de compartición
  const deckShareUrl = useMemo(() => {
    if (!activeDeck || activeDeck.cards.length === 0) return '';
    try {
      return getDeckShareUrl(activeDeck);
    } catch {
      return '';
    }
  }, [activeDeck]);

  const handleCopyShareLink = async () => {
    if (!deckShareUrl) return;
    try {
      await navigator.clipboard.writeText(deckShareUrl);
      setIsCopiedShare(true);
      setTimeout(() => setIsCopiedShare(false), 2200);
    } catch (e) {
      console.warn('Error al copiar enlace:', e);
    }
  };

  // Agrupación de cartas por tipo
  const groupedCategories = useMemo(() => {
    if (!activeDeck) return [];
    const remaining = [...activeDeck.cards];
    const groups: Array<{ key: string; label: string; items: typeof activeDeck.cards; count: number }> = [];

    for (const cat of CARD_TYPE_CATEGORIES) {
      if (cat.key === 'other') {
        if (remaining.length > 0) {
          const count = remaining.reduce((s, i) => s + i.quantity, 0);
          groups.push({ key: cat.key, label: cat.label, items: [...remaining], count });
        }
        break;
      }

      const matched: typeof activeDeck.cards = [];
      for (let i = remaining.length - 1; i >= 0; i--) {
        if (cat.match(remaining[i].card.typeLine)) {
          matched.unshift(remaining[i]);
          remaining.splice(i, 1);
        }
      }

      if (matched.length > 0) {
        const count = matched.reduce((s, i) => s + i.quantity, 0);
        groups.push({ key: cat.key, label: cat.label, items: matched, count });
      }
    }

    return groups;
  }, [activeDeck]);

  return (
    <div className="page-container deck-builder-page">
      {/* Header Bar */}
      <div className="deck-page-header">
        <div>
          <h1 className="deck-page-title">Constructor & Analizador de Mazos</h1>
          <p className="deck-page-subtitle">
            Crea estrategias, evalúa tu curva de maná, comparte tu lista y visualiza tu baraja en 3D.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="create-deck-btn"
          title="Crear un nuevo mazo"
        >
          <Plus size={15} />
          <span>Nuevo Mazo</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="deck-page-layout">
        {/* Left: Decks Sidebar */}
        <DeckSidebar
          decks={decks}
          activeDeckId={activeDeck?.id || null}
          onSelectDeck={setActiveDeckId}
          onDeleteDeck={onDeleteDeck}
        />

        {/* Right: Active Deck Workbench */}
        <main className="deck-main-panel">
          {activeDeck ? (
            <div className="active-deck-view">
              {/* Active Deck Header */}
              <div className="active-deck-header">
                <div>
                  <div className="deck-title-row">
                    <h2>{activeDeck.name}</h2>
                    <span className="deck-format-badge">{activeDeck.format.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: totalCardsCount >= targetFormatCount ? '#10b981' : '#f59e0b',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      {totalCardsCount} / {targetFormatCount} cartas
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: 'var(--accent-gold)',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(197, 160, 89, 0.08)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(197, 160, 89, 0.2)',
                      }}
                    >
                      Valor: {totalDeckValuePEN}
                    </span>
                  </div>
                </div>

                {/* Deck Action Buttons */}
                <div className="deck-action-buttons">
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    disabled={!deckShareUrl}
                    className={`deck-btn-secondary ${isCopiedShare ? 'copied' : ''}`}
                    title="Copiar enlace directo 3D para compartir este mazo"
                  >
                    {isCopiedShare ? <Check size={14} /> : <Link2 size={14} color="var(--accent-gold)" />}
                    <span>{isCopiedShare ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('catalog')}
                    className="deck-btn-secondary"
                    title="Buscar cartas en el catálogo para incorporar"
                  >
                    <Compass size={14} />
                    <span>Agregar Cartas</span>
                  </button>

                  <button
                    type="button"
                    className="deck-btn-secondary"
                    title="Exportar mazo a formato texto o MTG Arena"
                    onClick={() => setIsExportModalOpen(true)}
                  >
                    <Download size={14} />
                    <span>Exportar</span>
                  </button>

                  <button
                    type="button"
                    className="deck-btn-primary"
                    title="Visualizar este mazo completo apilado en 3D"
                    onClick={() => {
                      if (onInspectDeck3D) {
                        onInspectDeck3D(activeDeck.id);
                      } else {
                        onNavigate('deck-3d');
                      }
                    }}
                    disabled={activeDeck.cards.length === 0}
                  >
                    <Box size={14} />
                    <span>Ver Mazo en 3D</span>
                  </button>
                </div>
              </div>

              {/* Direct Share Link Display Banner */}
              {deckShareUrl && (
                <div className="deck-share-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                    <Link2 size={13} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                    <span className="deck-share-url-text">{deckShareUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="deck-btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', flexShrink: 0 }}
                  >
                    {isCopiedShare ? <Check size={12} /> : <Link2 size={12} />}
                    <span>{isCopiedShare ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              )}

              {/* Mana Curve and Stats */}
              <DeckStatsPanel deck={activeDeck} groupedCategories={groupedCategories} />

              {/* Card List grouped by type */}
              <DeckCardList
                deckId={activeDeck.id}
                groupedCategories={groupedCategories}
                totalCardsCount={totalCardsCount}
                onInspectCard={onInspectCard}
                onUpdateQuantity={onUpdateCardQuantity}
                onRemoveCard={onRemoveCardFromDeck}
                onNavigateToCatalog={() => onNavigate('catalog')}
              />
            </div>
          ) : (
            <div className="deck-empty-state">
              <Compass size={40} color="var(--text-muted)" />
              <h3>No tienes ningún mazo seleccionado</h3>
              <p>Selecciona un mazo en la barra lateral o crea uno nuevo para comenzar.</p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary-action"
              >
                <Plus size={14} />
                <span>Crear Primer Mazo</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <DeckCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateDeck={onCreateDeck}
        />
      )}

      {isExportModalOpen && activeDeck && (
        <DeckExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          deck={activeDeck}
        />
      )}
    </div>
  );
};

export default DeckBuilderPage;
