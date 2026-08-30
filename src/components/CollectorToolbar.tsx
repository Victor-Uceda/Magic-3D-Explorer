import React, { useState, useEffect } from 'react';
import { Palette, Zap, Check, X, Loader2, Repeat, Sparkles } from 'lucide-react';
import { scryfallClient, mapScryfallCardToDomain } from '../services/scryfall';
import type { Card } from '../types/card';
import type { CardFinish } from '../three/Card3D';

interface CollectorToolbarProps {
  currentCard: Card | null;
  currentFinish: CardFinish;
  onChangeFinish: (finish: CardFinish) => void;
  enableParticles?: boolean;
  onToggleParticles?: () => void;
  onSelectPrintVariant: (card: Card) => void;
  isFlipped?: boolean;
  onToggleFlip?: () => void;
}

export const CollectorToolbar: React.FC<CollectorToolbarProps> = ({
  currentCard,
  currentFinish,
  onChangeFinish,
  onSelectPrintVariant,
  isFlipped = false,
  onToggleFlip,
}) => {
  const [isArtModalOpen, setIsArtModalOpen] = useState(false);
  const [variants, setVariants] = useState<Card[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  // Load alternative printings when modal opens
  useEffect(() => {
    if (!isArtModalOpen || !currentCard?.name) return;

    let isMounted = true;
    const fetchPrints = async () => {
      setIsLoadingVariants(true);
      try {
        const rawPrints = await scryfallClient.getCardPrints(currentCard.name);
        if (isMounted) {
          const domainPrints = rawPrints.map(mapScryfallCardToDomain);
          setVariants(domainPrints);
        }
      } catch (err) {
        console.warn('No se pudieron cargar variantes:', err);
        if (isMounted) setVariants([]);
      } finally {
        if (isMounted) setIsLoadingVariants(false);
      }
    };

    fetchPrints();
    return () => {
      isMounted = false;
    };
  }, [isArtModalOpen, currentCard?.name]);

  if (!currentCard) return null;

  return (
    <>
      {/* Studio 3D Canvas Stage Dock (Anchored at bottom, never covering the card) */}
      <div className="collector-stage-dock" role="toolbar" aria-label="Acabados y controles de carta">
        {/* Normal Finish Button */}
        <button
          type="button"
          onClick={() => onChangeFinish('normal')}
          className={`dock-finish-btn ${currentFinish === 'normal' ? 'dock-finish-btn-active' : ''}`}
          title="Acabado estándar mate [N]"
        >
          <span className="finish-name">Normal</span>
          <span className="finish-shortcut">N</span>
        </button>

        {/* Foil Finish Button */}
        <button
          type="button"
          onClick={() => onChangeFinish('foil')}
          className={`dock-finish-btn ${currentFinish === 'foil' ? 'dock-finish-btn-active' : ''}`}
          title="Acabado Foil Tradicional con brillo iridiscente [F]"
        >
          <Sparkles size={12} className="finish-icon" />
          <span className="finish-name">Foil</span>
          <span className="finish-shortcut">F</span>
        </button>

        {/* Etched Finish Button */}
        <button
          type="button"
          onClick={() => onChangeFinish('etched')}
          className={`dock-finish-btn ${currentFinish === 'etched' ? 'dock-finish-btn-active' : ''}`}
          title="Acabado Etched Foil metálico grabado [E]"
        >
          <Zap size={12} className="finish-icon" />
          <span className="finish-name">Etched</span>
          <span className="finish-shortcut">E</span>
        </button>

        <div className="dock-separator" />

        {/* Flip 3D Button */}
        {onToggleFlip && (
          <button
            type="button"
            onClick={onToggleFlip}
            className={`dock-tool-btn ${isFlipped ? 'dock-tool-btn-active' : ''}`}
            title="Voltear cara de la carta (Presiona la barra de ESPACIO)"
          >
            <Repeat size={13} />
            <span>Voltear</span>
            <span className="finish-shortcut">ESPACIO</span>
          </button>
        )}

        {/* Art Variants Button */}
        <button
          type="button"
          onClick={() => setIsArtModalOpen(true)}
          className="dock-tool-btn"
          title="Ver impresiones e ilustraciones alternativas [V]"
        >
          <Palette size={13} />
          <span>Variantes</span>
          <span className="finish-shortcut">V</span>
        </button>
      </div>

      {/* Alternative Art Variants Studio Modal */}
      {isArtModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsArtModalOpen(false)}
        >
          <div
            className="variants-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="variants-modal-header">
              <div>
                <h3 className="variants-modal-title">Variantes & Ilustraciones Alternativas</h3>
                <p className="variants-modal-subtitle">
                  {currentCard.name} — Selecciona una impresión para verla en 3D
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsArtModalOpen(false)}
                className="modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="variants-modal-body">
              {isLoadingVariants && (
                <div className="variants-loading-state">
                  <Loader2 size={24} className="spin" color="var(--accent-gold)" />
                  <span>Buscando todas las impresiones en Scryfall...</span>
                </div>
              )}

              {!isLoadingVariants && variants.length === 0 && (
                <div className="variants-empty-state">
                  <p>No se encontraron impresiones alternativas registradas.</p>
                </div>
              )}

              {!isLoadingVariants && variants.length > 0 && (
                <div className="variants-grid">
                  {variants.map((variant) => {
                    const isSelected = variant.id === currentCard.id;
                    const usd = variant.prices.usd ? `$${variant.prices.usd}` : null;
                    const pen = variant.prices.usd ? `S/ ${(parseFloat(variant.prices.usd) * 3.75).toFixed(2)}` : null;
                    return (
                      <div
                        key={variant.id}
                        onClick={() => {
                          onSelectPrintVariant(variant);
                          setIsArtModalOpen(false);
                        }}
                        className={`variant-card-item ${isSelected ? 'variant-card-selected' : ''}`}
                      >
                        <div className="variant-img-wrapper">
                          <img
                            src={variant.imageUris.normal || variant.imageUris.small}
                            alt={variant.name}
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="variant-selected-badge">
                              <Check size={12} />
                              <span>Activa</span>
                            </div>
                          )}
                        </div>
                        <div className="variant-meta">
                          <span className="variant-set">{variant.setName}</span>
                          <div className="variant-details">
                            <span className="variant-collector">#{variant.collectorNumber}</span>
                            <span className="variant-price">{pen || usd || 'N/D'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CollectorToolbar;
