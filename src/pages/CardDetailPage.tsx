import React, { useState } from 'react';
import {
  ChevronLeft,
  Heart,
  PlusCircle,
  ExternalLink,
  Share2,
  Check,
} from 'lucide-react';
import { Scene } from '../three';
import { CardFinish } from '../three/Card3D';
import { CollectorToolbar } from '../components/CollectorToolbar';
import { CardInfoPanel } from '../components/CardInfoPanel';
import { SearchResultsDrawer } from '../components/SearchResultsDrawer';
import { getCardShareUrl } from '../utils/sharing';
import type { Card } from '../types/card';

interface CardDetailPageProps {
  card: Card;
  allCards: Card[];
  onSelectCard: (card: Card) => void;
  onBackToCatalog: () => void;
  backLabel?: string;
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
  searchSummary?: string;
  onAddToDeck?: (card: Card) => void;
  onToggleFavorite?: (card: Card) => void;
  isFavorite?: boolean;
}

/**
 * Página de Detalle e Inspección en 3D
 * 
 * Orquesta:
 * 1. Escena 3D de alta fidelidad con textura e iluminación física.
 * 2. Barra de acciones rápidas (volver al catálogo, agregar al mazo, favoritos, Scryfall).
 * 3. Panel lateral izquierdo: Sinergias recomendadas.
 * 4. Panel lateral derecho: Códice técnico de reglas, precios y legalidades.
 * 5. Barra inferior: Acabados (Normal, Foil, Etched), volteo 3D y selector de variantes.
 */
export const CardDetailPage: React.FC<CardDetailPageProps> = ({
  card,
  allCards: _allCards,
  onSelectCard,
  onBackToCatalog,
  backLabel,
  autoRotate,
  resetCameraTrigger,
  isFlipped,
  onToggleFlip,
  cardFinish,
  onChangeFinish,
  enableParticles,
  searchSummary: _searchSummary,
  onAddToDeck,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const [shareCopied, setShareCopied] = useState(false);

  return (
    <div className="card-detail-page-container">
      {/* Escena 3D principal en canvas WebGL */}
      <Scene
        card={card}
        autoRotate={autoRotate}
        resetCameraTrigger={resetCameraTrigger}
        isFlipped={isFlipped}
        finish={cardFinish}
        enableParticles={enableParticles}
        onToggleFlip={onToggleFlip}
      />

      {/* Barra superior de navegación y acciones rápidas */}
      <header className="viewer-top-bar" role="banner">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="viewer-back-btn"
          title={backLabel || 'Volver'}
        >
          <ChevronLeft size={16} />
          <span>{backLabel || 'Volver'}</span>
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

          <button
            type="button"
            className="viewer-action-btn"
            onClick={async () => {
              try {
                const url = getCardShareUrl(card);
                await navigator.clipboard.writeText(url);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2500);
              } catch {
                // fallback
              }
            }}
            title="Copiar enlace directo 3D"
          >
            {shareCopied ? <Check size={14} /> : <Share2 size={14} />}
            <span>{shareCopied ? '¡Copiado!' : 'Compartir'}</span>
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

      {/* Panel lateral izquierdo: Sinergias recomendadas */}
      <div className="floating-sidebar-left">
        <SearchResultsDrawer
          currentCard={card}
          onSelectCard={(selected) => onSelectCard(selected)}
        />
      </div>

      {/* Panel lateral derecho: Códice técnico de reglas MTG */}
      <div className="floating-sidebar-right">
        <CardInfoPanel
          card={card}
          onSelectCard={(selected) => onSelectCard(selected)}
        />
      </div>

      {/* Barra inferior: Control de acabados, volteo y variantes */}
      <CollectorToolbar
        currentCard={card}
        currentFinish={cardFinish}
        onChangeFinish={onChangeFinish}
        onSelectPrintVariant={(variant) => onSelectCard(variant)}
        isFlipped={isFlipped}
        onToggleFlip={onToggleFlip}
      />
    </div>
  );
};

export default CardDetailPage;
