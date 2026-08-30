import React from 'react';
import {
  Compass,
  ArrowRight,
  Box,
} from 'lucide-react';
import { formatPricePEN } from '../utils/pricing';
import type { Card } from '../types/card';
import type { AppRoute } from '../types/navigation';

interface HomeFeedProps {
  featuredCards: Card[];
  onSelectCard: (card: Card) => void;
  onNavigate: (route: AppRoute) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  featuredCards,
  onSelectCard,
  onNavigate,
}) => {
  return (
    <div className="page-container home-feed-page">
      {/* Editorial Header */}
      <section className="home-editorial-header">
        <h1 className="home-headline">
          Explorador 3D de Cartas y Mazos de Magic
        </h1>

        <p className="home-lead">
          Consulta precios en soles en tiempo real desde Scryfall, explora el catálogo completo y examina cada carta en el visor 3D interactivo con acabados Normal, Foil y Etched.
        </p>

        <div className="home-header-ctas">
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="btn-primary-action"
          >
            <Compass size={16} />
            <span>Explorar Catálogo</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('decks')}
            className="btn-secondary-action"
          >
            <span>Crear Mazo</span>
          </button>
        </div>
      </section>

      {/* Featured Iconic Cards Gallery */}
      <section className="home-gallery-section">
        <div className="section-header-clean">
          <div>
            <h2 className="section-heading">Selección Destacada</h2>
            <p className="section-subtext">
              Selecciona cualquier carta para abrir su modelo interactivo en 3D y ficha técnica.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="text-link-action"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="cards-grid">
          {featuredCards.slice(0, 8).map((card) => {
            const pricePen = formatPricePEN(card.prices.usd);
            return (
              <div
                key={card.id}
                className="catalog-card-item"
                onClick={() => onSelectCard(card)}
                title={`Abrir ${card.name} en 3D`}
              >
                <div className="card-image-wrapper">
                  <img
                    src={card.imageUris.normal || card.imageUris.small}
                    alt={card.name}
                    loading="lazy"
                  />
                  <div className="card-3d-badge-pill">
                    <Box size={12} />
                    <span>3D</span>
                  </div>
                </div>

                <div className="card-meta">
                  <span className="card-name" title={card.name}>{card.name}</span>
                  <div className="card-sub-meta">
                    <span className={`rarity-badge rarity-${card.rarity}`}>
                      {card.rarity.toUpperCase()}
                    </span>
                    <span className="card-price">{pricePen}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
