import React from 'react';
import {
  Heart,
  Bookmark,
  Compass,
  Box,
  Trash2,
} from 'lucide-react';
import { formatPricePEN } from '../utils/pricing';
import type { Card } from '../types/card';
import type { AppRoute } from '../types/navigation';

interface CollectionPageProps {
  favoriteCards: Card[];
  onSelectCard: (card: Card) => void;
  onRemoveFavorite: (cardId: string) => void;
  onNavigate: (route: AppRoute) => void;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({
  favoriteCards,
  onSelectCard,
  onRemoveFavorite,
  onNavigate,
}) => {
  return (
    <div className="page-container collection-page">
      {/* Header Bar */}
      <div className="collection-header">
        <div>
          <h1 className="collection-title">Mi Colección & Favoritos</h1>
          <p className="collection-subtitle">
            Acceso directo a tus cartas guardadas. Haz clic en cualquiera para abrir su modelo 3D.
          </p>
        </div>

        <div className="collection-stats-pill">
          <Heart size={15} fill="var(--accent-red)" color="var(--accent-red)" />
          <span>{favoriteCards.length} Cartas Guardadas</span>
        </div>
      </div>

      {/* Cards List or Empty State */}
      {favoriteCards.length === 0 ? (
        <div className="collection-empty-state">
          <Bookmark size={36} color="var(--text-muted)" />
          <h3>No tienes cartas en favoritos</h3>
          <p>Explora el catálogo y marca el icono de corazón en el visor 3D para guardarla aquí.</p>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="btn-primary-action"
          >
            <Compass size={14} />
            <span>Explorar Catálogo</span>
          </button>
        </div>
      ) : (
        <div className="catalog-cards-grid">
          {favoriteCards.map((card) => {
            const pricePen = formatPricePEN(card.prices.usd);
            return (
              <div
                key={card.id}
                className="catalog-grid-item"
                onClick={() => onSelectCard(card)}
                title={`Ver ${card.name} en 3D`}
              >
                <div className="card-media-wrapper">
                  <img
                    src={card.imageUris.normal || card.imageUris.small}
                    alt={card.name}
                    loading="lazy"
                  />
                  <div className="card-3d-badge-pill">
                    <Box size={12} />
                    <span>3D</span>
                  </div>

                  <button
                    type="button"
                    className="remove-fav-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(card.id);
                    }}
                    title="Eliminar de favoritos"
                  >
                    <Trash2 size={13} />
                  </button>
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
        </div>
      )}
    </div>
  );
};
