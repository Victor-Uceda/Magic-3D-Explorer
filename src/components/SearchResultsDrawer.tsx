import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { ManaCost } from './ManaCost';
import { formatPricePEN } from '../utils/pricing';
import { scryfallClient, mapScryfallCardToDomain } from '../services/scryfall';
import type { Card } from '../types/card';

interface SearchResultsDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  cards: Card[];
  currentCard: Card;
  onSelectCard: (card: Card) => void;
  totalCards?: number;
  searchQueryDescription?: string;
}

type DrawerTab = 'synergies' | 'results';

export const SearchResultsDrawer: React.FC<SearchResultsDrawerProps> = ({
  cards,
  currentCard,
  onSelectCard,
  totalCards = 0,
  searchQueryDescription,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<DrawerTab>('synergies');
  const [synergies, setSynergies] = useState<Card[]>([]);
  const [isLoadingSynergies, setIsLoadingSynergies] = useState(false);

  // Fetch synergies whenever currentCard changes
  useEffect(() => {
    if (!currentCard) return;

    let isMounted = true;
    const loadSynergies = async () => {
      setIsLoadingSynergies(true);
      try {
        const queryParts: string[] = [];
        if (currentCard.colors && currentCard.colors.length > 0) {
          queryParts.push(`c:${currentCard.colors.join('')}`);
        }
        const mainType = currentCard.typeLine.split('—')[0].trim().split(' ').pop();
        if (mainType && mainType.length > 2) {
          queryParts.push(`t:${mainType}`);
        }

        const q = queryParts.length > 0 ? queryParts.join(' ') : 'r:rare';
        const res = await scryfallClient.searchCards(`${q} -name:"${currentCard.name}" order:edhrec`);
        if (isMounted && res.data) {
          setSynergies(res.data.slice(0, 15).map(mapScryfallCardToDomain));
        }
      } catch {
        if (isMounted) setSynergies([]);
      } finally {
        if (isMounted) setIsLoadingSynergies(false);
      }
    };

    loadSynergies();
    return () => {
      isMounted = false;
    };
  }, [currentCard]);

  const displayedCards = activeTab === 'synergies' ? synergies : cards;
  const hasItems = displayedCards.length > 0;

  return (
    <aside
      className={`grimoire-drawer-panel ${isCollapsed ? 'grimoire-drawer-collapsed' : ''}`}
      aria-label="Sinergias y resultados"
    >
      {/* Side-tab toggle attached strictly outside the panel */}
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="grimoire-drawer-tab-toggle"
        title={isCollapsed ? 'Desplegar panel de cartas' : 'Ocultar panel'}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {!isCollapsed && (
        <div className="drawer-panel-inner">
          {/* Header with Clean Tabs (Sinergias / Resultados) */}
          <div className="drawer-nav-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('synergies')}
              className={`drawer-tab-btn ${activeTab === 'synergies' ? 'drawer-tab-btn-active' : ''}`}
            >
              <Sparkles size={13} />
              <span>Sinergias ({synergies.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('results')}
              className={`drawer-tab-btn ${activeTab === 'results' ? 'drawer-tab-btn-active' : ''}`}
            >
              <Layers size={13} />
              <span>Resultados ({totalCards || cards.length})</span>
            </button>
          </div>

          {/* Subtitle / Context info */}
          {searchQueryDescription && activeTab === 'results' && (
            <div className="drawer-search-context" title={searchQueryDescription}>
              <span>{searchQueryDescription}</span>
            </div>
          )}

          {/* Loading State for Synergies */}
          {activeTab === 'synergies' && isLoadingSynergies && (
            <div className="drawer-loading-state">
              <span>Buscando sinergias para {currentCard.name}...</span>
            </div>
          )}

          {/* Empty State */}
          {!hasItems && !isLoadingSynergies && (
            <div className="drawer-empty-state">
              <Search size={22} color="var(--text-muted)" />
              <p>Sin cartas disponibles en esta pestaña</p>
            </div>
          )}

          {/* Cards List with Identical Design to MTG Codex */}
          {hasItems && (
            <div className="drawer-cards-scroll">
              {displayedCards.map((c) => {
                const isSelected = currentCard.id === c.id;
                const pricePen = formatPricePEN(c.prices.usd);
                const imgUrl = c.imageUris.small || c.imageUris.normal;

                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectCard(c)}
                    className={`drawer-card-item ${isSelected ? 'drawer-card-item-selected' : ''}`}
                    title={`Examinar ${c.name} en 3D`}
                  >
                    <img
                      src={imgUrl}
                      alt={c.name}
                      className="drawer-item-thumb"
                      loading="lazy"
                    />

                    <div className="drawer-item-details">
                      <div className="drawer-item-top">
                        <span className="drawer-item-name" title={c.name}>
                          {c.name}
                        </span>
                        {c.manaCost && (
                          <div className="drawer-item-mana">
                            <ManaCost manaCost={c.manaCost} size={13} />
                          </div>
                        )}
                      </div>

                      <div className="drawer-item-bottom">
                        <div className="drawer-item-meta">
                          <span className={`rarity-tag rarity-tag-${c.rarity}`}>
                            {c.rarity.charAt(0).toUpperCase()}
                          </span>
                          <span className="drawer-item-type">{c.typeLine.split('—')[0]}</span>
                        </div>

                        <span className="drawer-item-price">{pricePen}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default SearchResultsDrawer;
