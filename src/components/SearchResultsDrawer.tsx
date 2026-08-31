import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { ManaCost } from './ManaCost';
import { formatPricePEN } from '../utils/pricing';
import { scryfallClient, mapScryfallCardToDomain } from '../services/scryfall';
import type { Card } from '../types/card';

interface SearchResultsDrawerProps {
  currentCard: Card;
  onSelectCard: (card: Card) => void;
  isOpenManual?: boolean;
  onToggleManual?: (open: boolean) => void;
}

// Caché en memoria de sinergias para evitar re-peticiones y parpadeos al cambiar acabados o voltear
const synergiesCache = new Map<string, Card[]>();

export const SearchResultsDrawerComponent: React.FC<SearchResultsDrawerProps> = ({
  currentCard,
  onSelectCard,
  isOpenManual,
  onToggleManual,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Sincronizar con control externo
  useEffect(() => {
    if (isOpenManual !== undefined) {
      setIsCollapsed(!isOpenManual);
    }
  }, [isOpenManual]);

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      onToggleManual?.(!next);
      return next;
    });
  };

  const [synergies, setSynergies] = useState<Card[]>(() => {
    return currentCard ? synergiesCache.get(currentCard.id) || [] : [];
  });
  const [isLoadingSynergies, setIsLoadingSynergies] = useState(false);

  // Fetch synergies whenever currentCard.id changes
  useEffect(() => {
    if (!currentCard || !currentCard.id) return;

    // Si ya están en caché para esta carta, usarlas de inmediato
    if (synergiesCache.has(currentCard.id)) {
      setSynergies(synergiesCache.get(currentCard.id)!);
      setIsLoadingSynergies(false);
      return;
    }

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
          const domainSynergies = res.data.slice(0, 15).map(mapScryfallCardToDomain);
          synergiesCache.set(currentCard.id, domainSynergies);
          setSynergies(domainSynergies);
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

  const hasItems = synergies.length > 0;

  return (
    <aside
      className={`grimoire-drawer-panel ${isCollapsed ? 'grimoire-drawer-collapsed' : ''}`}
      aria-label="Sinergias recomendadas"
    >
      {/* Side-tab toggle attached strictly outside the panel */}
      <button
        type="button"
        onClick={handleToggle}
        className="grimoire-drawer-tab-toggle"
        title={isCollapsed ? 'Desplegar panel de sinergias' : 'Ocultar panel'}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {!isCollapsed && (
        <div className="drawer-panel-inner">
          {/* Header — Pure Sinergias (No Resultados tab) */}
          <div className="drawer-header-clean" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span className="drawer-header-title">
              Sinergias Recomendadas
            </span>
            <Sparkles size={14} color="var(--accent-gold)" />
          </div>

          {/* Loading State for Synergies */}
          {isLoadingSynergies && (
            <div className="drawer-loading-state">
              <span>Buscando sinergias para {currentCard.name}...</span>
            </div>
          )}

          {/* Empty State */}
          {!hasItems && !isLoadingSynergies && (
            <div className="drawer-empty-state">
              <Search size={22} color="#64748b" />
              <p>Sin sinergias disponibles</p>
            </div>
          )}

          {/* Synergies List with Noble MTG Card Item Layout */}
          {hasItems && !isLoadingSynergies && (
            <div className="drawer-cards-scroll">
              {synergies.map((c) => {
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

export const SearchResultsDrawer = React.memo(
  SearchResultsDrawerComponent,
  (prev, next) => prev.currentCard?.id === next.currentCard?.id
);

export default SearchResultsDrawer;
