import React from 'react';
import {
  X,
  Box,
  PlusCircle,
  Heart,
  ExternalLink,
  DollarSign,
  Layers,
  Award,
} from 'lucide-react';
import { ManaCost } from '../ManaCost';
import { OracleText } from '../OracleText';
import type { Card } from '../../types/card';

interface QuickViewModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onView3D: (card: Card) => void;
  onAddToDeck?: (card: Card) => void;
  onToggleFavorite?: (card: Card) => void;
  isFavorite?: boolean;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  card,
  isOpen,
  onClose,
  onView3D,
  onAddToDeck,
  onToggleFavorite,
  isFavorite = false,
}) => {
  if (!isOpen || !card) return null;

  const usd = card.prices.usd ? parseFloat(card.prices.usd) : null;
  const pen = usd ? (usd * 3.75).toFixed(2) : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="quick-view-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Vista rápida de ${card.name}`}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        <div className="quick-view-modal-content">
          {/* Card Visual Side */}
          <div className="quick-view-card-side">
            <img
              src={card.imageUris.large || card.imageUris.normal}
              alt={card.name}
              className="quick-view-card-img"
            />
          </div>

          {/* Card Info & Actions Side */}
          <div className="quick-view-info-side">
            <div className="quick-view-header">
              <div className="quick-view-title-group">
                <h3>{card.name}</h3>
                <span className="quick-view-type">{card.typeLine}</span>
              </div>
              <div className="quick-view-mana">
                <ManaCost manaCost={card.manaCost} />
              </div>
            </div>

            {/* Metas & Tags */}
            <div className="quick-view-meta-grid">
              <div className="meta-item">
                <Layers size={13} color="var(--text-muted)" />
                <span>{card.setName} ({card.setCode.toUpperCase()})</span>
              </div>
              <div className="meta-item">
                <Award size={13} color="var(--accent-gold)" />
                <span className={`rarity-tag rarity-${card.rarity}`}>
                  {card.rarity.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Oracle Text */}
            <div className="quick-view-oracle">
              <OracleText text={card.oracleText} />
            </div>

            {/* Pricing Box */}
            <div className="quick-view-price-box">
              <div className="price-label-group">
                <DollarSign size={16} color="var(--accent-gold)" />
                <span>Valor de Mercado</span>
              </div>
              <div className="price-values">
                <span className="price-usd">{usd ? `$${usd.toFixed(2)}` : 'N/D'}</span>
                {pen && <span className="price-pen">(S/ {pen})</span>}
              </div>
            </div>

            {/* Hierarchical Actions */}
            <div className="quick-view-actions">
              <button
                type="button"
                className="action-btn-primary"
                onClick={() => {
                  onClose();
                  onView3D(card);
                }}
              >
                <Box size={16} />
                <span>Ver en 3D (Estudio)</span>
              </button>

              <div className="action-btn-row">
                <button
                  type="button"
                  className="action-btn-secondary"
                  onClick={() => onAddToDeck && onAddToDeck(card)}
                >
                  <PlusCircle size={15} />
                  <span>Agregar al Mazo</span>
                </button>

                <button
                  type="button"
                  className={`action-btn-tertiary ${isFavorite ? 'favorite-active' : ''}`}
                  onClick={() => onToggleFavorite && onToggleFavorite(card)}
                  title={isFavorite ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
                >
                  <Heart size={15} fill={isFavorite ? 'var(--accent-red)' : 'none'} color={isFavorite ? 'var(--accent-red)' : 'currentColor'} />
                </button>

                {card.scryfallUri && (
                  <a
                    href={card.scryfallUri}
                    target="_blank"
                    rel="noreferrer"
                    className="action-btn-tertiary"
                    title="Ver en Scryfall"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
