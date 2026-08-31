import React, { useEffect, useRef, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Box,
  Loader2,
  AlertCircle,
  RotateCcw,
  X,
} from 'lucide-react';
import { CardSkeleton } from '../components/cards/CardSkeleton';
import { formatPricePEN } from '../utils/pricing';
import type { Card } from '../types/card';
import type { FilterState } from '../types/filters';

export type SortOption = 'name' | 'price-desc' | 'price-asc' | 'rarity' | 'cmc-desc' | 'cmc-asc';

interface CatalogGridProps {
  cards: Card[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  totalCardsCount?: number;
  errorMessage: string | null;
  searchSummary: string;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState, value?: string) => void;
  onSelectCard: (card: Card) => void;
  onOpenFilters: () => void;
  onRetry: () => void;
  activeFilterCount: number;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  cards,
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  totalCardsCount,
  errorMessage,
  searchSummary: _searchSummary,
  sortBy,
  onSortChange,
  filters,
  onRemoveFilter,
  onSelectCard,
  onOpenFilters,
  onRetry,
  activeFilterCount,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Ordenamiento memoizado en memoria
  const sortedCards = useMemo(() => {
    const list = [...cards];
    switch (sortBy) {
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-desc':
        return list.sort((a, b) => {
          const pA = a.prices.usd ? parseFloat(a.prices.usd) : -1;
          const pB = b.prices.usd ? parseFloat(b.prices.usd) : -1;
          return pB - pA;
        });
      case 'price-asc':
        return list.sort((a, b) => {
          const pA = a.prices.usd ? parseFloat(a.prices.usd) : 999999;
          const pB = b.prices.usd ? parseFloat(b.prices.usd) : 999999;
          return pA - pB;
        });
      case 'cmc-desc':
        return list.sort((a, b) => b.cmc - a.cmc);
      case 'cmc-asc':
        return list.sort((a, b) => a.cmc - b.cmc);
      case 'rarity': {
        const rarityWeight: Record<string, number> = { mythic: 4, rare: 3, uncommon: 2, common: 1 };
        return list.sort((a, b) => (rarityWeight[b.rarity] || 0) - (rarityWeight[a.rarity] || 0));
      }
      default:
        return list;
    }
  }, [cards, sortBy]);

  // IntersectionObserver for seamless Infinite Scroll proximity triggering
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore || !onLoadMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '800px', threshold: 0.05 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  return (
    <div className="page-container catalog-page">
      {/* Catalog Header Controls */}
      <div className="catalog-toolbar">
        <div className="catalog-toolbar-left">
          <h1 className="catalog-title">Catálogo de Cartas</h1>
          <span className="catalog-count">
            {isLoading
              ? 'Buscando...'
              : totalCardsCount !== undefined
              ? `${totalCardsCount.toLocaleString()} cartas`
              : `${cards.length} cartas`}
          </span>
        </div>

        <div className="catalog-toolbar-right">
          {/* Filter Trigger Button */}
          <button
            type="button"
            onClick={onOpenFilters}
            className={`catalog-filter-btn ${activeFilterCount > 0 ? 'catalog-filter-btn-active' : ''}`}
          >
            <SlidersHorizontal size={14} />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="catalog-sort-wrapper">
            <ArrowUpDown size={14} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="catalog-sort-select"
              aria-label="Ordenar resultados"
            >
              <option value="name">Nombre (A-Z)</option>
              <option value="price-desc">Precio (Mayor a Menor)</option>
              <option value="price-asc">Precio (Menor a Mayor)</option>
              <option value="rarity">Rareza (Mítica a Común)</option>
              <option value="cmc-desc">Coste de Maná (Mayor a Menor)</option>
              <option value="cmc-asc">Coste de Maná (Menor a Mayor)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="active-filter-chips-row">
          <span className="filter-chips-label">Filtros activos:</span>
          {filters.colors.map((c) => (
            <button
              key={`color-${c}`}
              type="button"
              className="filter-chip"
              onClick={() => onRemoveFilter('colors', c)}
            >
              <span>Color: {c}</span>
              <X size={12} />
            </button>
          ))}
          {filters.types.map((t) => (
            <button
              key={`type-${t}`}
              type="button"
              className="filter-chip"
              onClick={() => onRemoveFilter('types', t)}
            >
              <span>Tipo: {t}</span>
              <X size={12} />
            </button>
          ))}
          {filters.format && (
            <button
              type="button"
              className="filter-chip"
              onClick={() => onRemoveFilter('format')}
            >
              <span>Formato: {filters.format}</span>
              <X size={12} />
            </button>
          )}
          {filters.rarity && (
            <button
              type="button"
              className="filter-chip"
              onClick={() => onRemoveFilter('rarity')}
            >
              <span>Rareza: {filters.rarity}</span>
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Initial Loading Skeleton State */}
      {isLoading && cards.length === 0 && (
        <div className="catalog-cards-grid">
          <CardSkeleton count={12} />
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && cards.length === 0 && (
        <div className="catalog-status-state error-state">
          <AlertCircle size={36} color="var(--accent-red)" />
          <h3>No se pudieron cargar las cartas</h3>
          <p>{errorMessage}</p>
          <button type="button" onClick={onRetry} className="retry-btn">
            <RotateCcw size={14} />
            <span>Reintentar Búsqueda</span>
          </button>
        </div>
      )}

      {/* Empty Results State */}
      {!isLoading && !errorMessage && cards.length === 0 && (
        <div className="catalog-status-state empty-state">
          <Search size={40} color="var(--text-muted)" />
          <h3>No se encontraron cartas</h3>
          <p>Prueba ajustando los filtros o utilizando un término de búsqueda diferente.</p>
          <button type="button" onClick={onOpenFilters} className="retry-btn">
            <SlidersHorizontal size={14} />
            <span>Modificar Filtros</span>
          </button>
        </div>
      )}

      {/* Cards Responsive Grid */}
      {sortedCards.length > 0 && (
        <>
          <div className="catalog-cards-grid">
            {sortedCards.map((card) => {
              const pricePen = formatPricePEN(card.prices.usd);
              return (
                <div
                  key={card.id}
                  className="catalog-grid-item"
                  onClick={() => onSelectCard(card)}
                  title={`Examinar ${card.name} en 3D`}
                >
                  <div className="card-media-wrapper">
                    <img
                      src={card.imageUris.small || card.imageUris.normal}
                      alt={card.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="card-3d-badge-pill">
                      <Box size={12} />
                      <span>3D</span>
                    </div>
                  </div>

                  <div className="card-item-meta">
                    <span className="card-item-name" title={card.name}>{card.name}</span>
                    <div className="card-item-details">
                      <span className={`rarity-pill rarity-${card.rarity}`}>
                        {card.rarity.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="card-item-type">{card.typeLine.split('—')[0].trim()}</span>
                      <span className="card-item-price">{pricePen}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Skeletons when loading next batch */}
            {isLoadingMore && <CardSkeleton count={4} />}
          </div>

          {/* Infinite Scroll Proximity Sentinel Element */}
          {hasMore && (
            <div ref={sentinelRef} className="infinite-scroll-sentinel">
              {isLoadingMore && (
                <div className="loading-more-indicator">
                  <Loader2 size={16} className="spin" color="var(--accent-gold)" />
                  <span>Cargando más cartas...</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
