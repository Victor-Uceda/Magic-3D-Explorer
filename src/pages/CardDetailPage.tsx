import React from 'react';
import {
  ChevronLeft,
  Heart,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { Scene } from '../three';
import { CardFinish } from '../three/Card3D';
import { CollectorToolbar } from '../components/CollectorToolbar';
import { CardInfoPanel } from '../components/CardInfoPanel';
import { SearchResultsDrawer } from '../components/SearchResultsDrawer';
import type { Card } from '../types/card';

interface CardDetailPageProps {
  card: Card;
  allCards: Card[];
  onSelectCard: (card: Card) => void;
  onBackToCatalog: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  resetCameraTrigger: number;
  onResetCamera: () => void;
  isFlipped: boolean;
  onToggleFlip: () => void;
  cardFinish: CardFinish;
  onChangeFinish: (finish: CardFinish) => void;
  enableParticles: boolean;
  onToggleParticles: () => void;
  searchSummary: string;
  onAddToDeck?: (card: Card) => void;
  onToggleFavorite?: (card: Card) => void;
  isFavorite?: boolean;
}

export const CardDetailPage: React.FC<CardDetailPageProps> = ({
  card,
  allCards,
  onSelectCard,
  onBackToCatalog,
  autoRotate,
  resetCameraTrigger,
  isFlipped,
  onToggleFlip,
  cardFinish,
  onChangeFinish,
  enableParticles,
  onToggleParticles,
  searchSummary,
  onAddToDeck,
  onToggleFavorite,
  isFavorite = false,
}) => {
  return (
    <div className="card-detail-page-container">
      {/* Background 3D High-Fidelity Studio Scene */}
      <Scene
        card={card}
        autoRotate={autoRotate}
        resetCameraTrigger={resetCameraTrigger}
        isFlipped={isFlipped}
        finish={cardFinish}
        enableParticles={enableParticles}
        onToggleFlip={onToggleFlip}
      />

      {/* Floating Header Bar (Top - Glassmorphic Sanctum Style) */}
      <header className="viewer-top-bar" role="banner">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="viewer-back-btn"
          title="Volver al Catálogo"
        >
          <ChevronLeft size={16} />
          <span>Volver al Catálogo</span>
        </button>

        <div className="viewer-card-title-badge">
          <span className="badge-card-name">{card.name}</span>
          <span className="badge-separator">•</span>
          <span className="badge-set">{card.setName}</span>
        </div>

        <div className="viewer-quick-actions">
          <button
            type="button"
            className="viewer-action-btn"
            onClick={() => onAddToDeck && onAddToDeck(card)}
            title="Agregar al mazo"
          >
            <PlusCircle size={14} />
            <span>Al Mazo</span>
          </button>

          <button
            type="button"
            className={`viewer-action-btn ${isFavorite ? 'viewer-fav-active' : ''}`}
            onClick={() => onToggleFavorite && onToggleFavorite(card)}
            title={isFavorite ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
          >
            <Heart size={14} fill={isFavorite ? 'var(--accent-red)' : 'none'} color={isFavorite ? 'var(--accent-red)' : 'currentColor'} />
          </button>

          {card.scryfallUri && (
            <a
              href={card.scryfallUri}
              target="_blank"
              rel="noreferrer"
              className="viewer-action-btn"
              title="Abrir en Scryfall"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </header>

      {/* Left Drawer: Synergies & Search Results */}
      <div className="floating-sidebar-left">
        <SearchResultsDrawer
          cards={allCards}
          currentCard={card}
          onSelectCard={(selected) => onSelectCard(selected)}
          totalCards={allCards.length}
          searchQueryDescription={searchSummary}
        />
      </div>

      {/* Right Drawer: Card Technical Specifications & MTG Codex */}
      <div className="floating-sidebar-right">
        <CardInfoPanel
          card={card}
          onSelectCard={(selected) => onSelectCard(selected)}
        />
      </div>

      {/* Floating Studio Controls Dock (Normal, Foil, Etched, Flip, Rotation) */}
      <CollectorToolbar
        currentCard={card}
        currentFinish={cardFinish}
        onChangeFinish={onChangeFinish}
        enableParticles={enableParticles}
        onToggleParticles={onToggleParticles}
        onSelectPrintVariant={(variant) => onSelectCard(variant)}
        isFlipped={isFlipped}
        onToggleFlip={onToggleFlip}
      />
    </div>
  );
};

export default CardDetailPage;
