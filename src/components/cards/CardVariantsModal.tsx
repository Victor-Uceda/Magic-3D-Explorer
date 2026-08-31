import React, { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { scryfallClient, mapScryfallCardToDomain } from '../../services/scryfall';
import { formatPricePEN } from '../../utils/pricing';
import type { Card } from '../../types/card';

interface CardVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCard: Card;
  onSelectVariant: (variant: Card) => void;
}

export const CardVariantsModal: React.FC<CardVariantsModalProps> = ({
  isOpen,
  onClose,
  currentCard,
  onSelectVariant,
}) => {
  const [variants, setVariants] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Keyboard shortcut 'Escape' to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load alternative printings when modal opens
  useEffect(() => {
    if (!isOpen || !currentCard?.name) return;

    let isMounted = true;
    const fetchPrints = async () => {
      setIsLoading(true);
      try {
        const rawPrints = await scryfallClient.getCardPrints(
          currentCard.name,
          currentCard.printsSearchUri
        );
        if (isMounted) {
          const domainPrints = rawPrints.map(mapScryfallCardToDomain);
          setVariants(domainPrints);
        }
      } catch (err) {
        console.warn('No se pudieron cargar variantes:', err);
        if (isMounted) setVariants([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPrints();
    return () => {
      isMounted = false;
    };
  }, [isOpen, currentCard?.name, currentCard?.printsSearchUri]);

  if (!isOpen) return null;

  return (
    <div
      className="variants-art-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="variants-modal-title"
    >
      <div className="variants-art-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="variants-modal-header">
          <div>
            <h3 id="variants-modal-title" className="variants-modal-title">
              Variantes & Ilustraciones Alternativas
            </h3>
            <p className="variants-modal-subtitle">
              {currentCard.name} — Selecciona una impresión para examinarla en 3D
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-icon-btn"
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="variants-modal-body">
          {isLoading && (
            <div className="variants-loading-state">
              <Loader2 size={24} className="spin" color="#cbd5e1" />
              <span>Buscando todas las impresiones en Scryfall...</span>
            </div>
          )}

          {!isLoading && variants.length === 0 && (
            <div className="variants-empty-state">
              <p>No se encontraron impresiones alternativas registradas.</p>
            </div>
          )}

          {!isLoading && variants.length > 0 && (
            <div className="variants-modal-grid">
              {variants.map((variant) => {
                const isSelected = variant.id === currentCard.id;
                const pricePen = formatPricePEN(variant.prices.usd);
                return (
                  <div
                    key={variant.id}
                    onClick={() => {
                      onSelectVariant(variant);
                      onClose();
                    }}
                    className={`variant-card-card ${isSelected ? 'variant-card-card-active' : ''}`}
                    title={`Cargar edición de ${variant.setName} en 3D`}
                  >
                    <div className="variant-thumb-box">
                      <img
                        src={variant.imageUris.normal || variant.imageUris.small}
                        alt={variant.name}
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="variant-active-badge">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <div className="variant-card-meta">
                      <span className="variant-card-set" title={variant.setName}>
                        {variant.setName}
                      </span>
                      <span className="variant-card-price">{pricePen}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
