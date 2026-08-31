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
      {/* Clean, Focused Hero Section */}
      <section className="home-hero-cinematic">
        <div className="hero-content-wrapper">
          <h1 className="hero-epic-title">
            <span className="hero-title-sub">EXPLORADOR </span>
            <span className="hero-title-main">MAGIC 3D</span>
          </h1>

          <p className="hero-tagline">
            Examina cartas legendarias en tres dimensiones con acabados Normal, Foil y Etched, cotizaciones en Soles y análisis de sinergias.
          </p>

          <div className="hero-actions-row">
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="hero-primary-cta"
            >
              <Compass size={16} />
              <span>Explorar Catálogo 3D</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Iconic Cards Gallery */}
      <section className="home-gallery-section">
        <div className="section-header-clean">
          <div>
            <h2 className="section-heading">Selección de Cartas Legendarias</h2>
            <p className="section-subtext">
              Haz clic en cualquier carta para entrar al estudio 3D interactivo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="text-link-action"
          >
            <span>Ver catálogo completo</span>
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
                title={`Examinar ${card.name} en 3D`}
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

      <section className="footer-section">
        <div className="footer-content">
          <p>Desarrollado por Victor Uceda</p>
          <p>
            @2026 Todos los derechos reservados para Wizards of the Coast.
          </p>
          <p>
            Proyecto Personal sin fines de lucro.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomeFeed;
