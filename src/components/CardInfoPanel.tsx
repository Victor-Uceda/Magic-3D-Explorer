import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { OracleText } from './OracleText';
import { ManaCost } from './ManaCost';
import { formatPricePEN } from '../utils/pricing';
import type { Card } from '../types/card';

interface CardInfoPanelProps {
  card: Card | null;
  onSelectCard?: (card: Card) => void;
  isOpenManual?: boolean;
  onToggleManual?: (open: boolean) => void;
}

const CardInfoPanelComponent: React.FC<CardInfoPanelProps> = ({
  card,
  isOpenManual,
  onToggleManual,
}) => {
  // Inicia colapsado en pantallas móviles (< 1024px) para no tapar la carta 3D por defecto
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Sincronizar si se controla externamente mediante botón de barra superior
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

  if (!card) return null;

  const hasCombatStats = card.power !== undefined && card.toughness !== undefined;
  const hasLoyalty = card.loyalty !== undefined;
  const pricePen = formatPricePEN(card.prices.usd);

  // Clean flavor text to avoid duplicate quotes
  const cleanFlavorText = card.flavorText
    ? card.flavorText.replace(/^["“”\s]+|["“”\s]+$/g, '').trim()
    : null;

  // Key format legalities
  const formats = [
    { name: 'Commander', status: card.legalities.commander },
    { name: 'Modern', status: card.legalities.modern },
    { name: 'Standard', status: card.legalities.standard },
    { name: 'Pioneer', status: card.legalities.pioneer },
    { name: 'Legacy', status: card.legalities.legacy },
    { name: 'Vintage', status: card.legalities.vintage },
    { name: 'Pauper', status: card.legalities.pauper },
  ];

  return (
    <aside
      className={`grimoire-hud-panel ${isCollapsed ? 'grimoire-hud-collapsed' : ''}`}
      aria-label="Ficha técnica de la carta"
    >
      {/* Side-tab toggle attached strictly outside the panel */}
      <button
        type="button"
        onClick={handleToggle}
        className="grimoire-tab-toggle"
        title={isCollapsed ? 'Desplegar ficha de carta' : 'Ocultar ficha de carta'}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {!isCollapsed && (
        <div className="grimoire-content-scroll">
          {/* Header & Title */}
          <div className="grimoire-header">
            <div className="grimoire-title-row">
              <h2 className="grimoire-card-name">{card.name}</h2>
              {(card.manaCost || (card.colorIdentity && card.colorIdentity.length > 0)) && (
                <div className="grimoire-mana-cost" title="Coste de Maná / Identidad de Color">
                  {card.manaCost ? (
                    <ManaCost manaCost={card.manaCost} size={22} />
                  ) : (
                    <ManaCost manaCost={card.colorIdentity?.map((c) => `{${c}}`).join('') || '{C}'} size={20} />
                  )}
                </div>
              )}
            </div>

            <div className="grimoire-type-row">
              <span className="grimoire-type-text">{card.typeLine}</span>
              <span className={`rarity-tag rarity-tag-${card.rarity}`}>
                {card.rarity.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Market Valuation Row */}
          <div className="grimoire-price-row">
            <span className="price-label">PRECIO MERCADO</span>
            <div className="price-value-group">
              <span className="price-pen">{pricePen}</span>
              {card.prices.usd && <span className="price-usd">(${card.prices.usd} USD)</span>}
              {card.prices.usdFoil && (
                <span className="price-usd" style={{ color: 'var(--accent-gold)' }}>
                  (Foil: ${card.prices.usdFoil})
                </span>
              )}
            </div>
          </div>

          {/* Stats Bar (P/T, Loyalty, EDHREC Rank, CMC) */}
          <div className="grimoire-metrics-row">
            {hasCombatStats && (
              <div className="metric-chip">
                <span className="metric-label">P / T</span>
                <span className="metric-val">{card.power} / {card.toughness}</span>
              </div>
            )}
            {hasLoyalty && (
              <div className="metric-chip">
                <span className="metric-label">LEALTAD</span>
                <span className="metric-val">[{card.loyalty}]</span>
              </div>
            )}
            <div className="metric-chip">
              <span className="metric-label">COSTE (CMC)</span>
              <span className="metric-val">{card.cmc}</span>
            </div>
            {card.edhrecRank && (
              <div className="metric-chip">
                <span className="metric-label">EDHREC</span>
                <span className="metric-val">#{card.edhrecRank.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Primary Rules Text (Oracle) */}
          {card.oracleText && (
            <div className="grimoire-oracle-section">
              <div className="section-eyebrow">Texto de Reglas</div>
              <OracleText text={card.oracleText} symbolSize={15} className="oracle-text-content" />
            </div>
          )}

          {/* Back Face Rules Text (For DFC) */}
          {card.backOracleText && (
            <div className="grimoire-oracle-section" style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
              <div className="section-eyebrow">
                Cara Trasera: {card.backName || 'Reverso'} {card.backTypeLine ? `(${card.backTypeLine})` : ''}
              </div>
              <OracleText text={card.backOracleText} symbolSize={15} className="oracle-text-content" />
            </div>
          )}

          {/* Flavor Text */}
          {cleanFlavorText && (
            <div className="grimoire-flavor-section">
              <p className="flavor-quote">"{cleanFlavorText}"</p>
            </div>
          )}

          {/* Legalities */}
          <div className="grimoire-legalities-section">
            <div className="section-eyebrow">Legalidad por Formato</div>
            <div className="legalities-list">
              {formats.map((f) => {
                const isLegal = f.status === 'legal';
                const isRestricted = f.status === 'restricted';
                const isBanned = f.status === 'banned';
                return (
                  <span
                    key={f.name}
                    className={`format-tag ${isLegal ? 'format-legal' : 'format-not-legal'}`}
                    title={`${f.name}: ${f.status}`}
                  >
                    <span
                      className="format-dot"
                      style={{
                        background: isLegal
                          ? '#10b981'
                          : isRestricted
                          ? '#f59e0b'
                          : isBanned
                          ? '#ef4444'
                          : '#475569',
                      }}
                    />
                    <span>{f.name}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Metadata Full Footer */}
          <div className="grimoire-meta-footer">
            <div className="meta-line">
              <span className="meta-k">Colección:</span>
              <span className="meta-v">{card.setName} [{card.setCode.toUpperCase()}] #{card.collectorNumber}</span>
            </div>
            {card.artist && (
              <div className="meta-line">
                <span className="meta-k">Ilustrador:</span>
                <span className="meta-v">{card.artist}</span>
              </div>
            )}
            {card.releasedAt && (
              <div className="meta-line">
                <span className="meta-k">Lanzamiento:</span>
                <span className="meta-v">{card.releasedAt}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export const CardInfoPanel = React.memo(
  CardInfoPanelComponent,
  (prev, next) => prev.card?.id === next.card?.id
);

export default CardInfoPanel;
