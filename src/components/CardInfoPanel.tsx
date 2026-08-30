import React, { useState } from 'react';
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
}

export const CardInfoPanel: React.FC<CardInfoPanelProps> = ({ card }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
  ];

  return (
    <aside
      className={`grimoire-hud-panel ${isCollapsed ? 'grimoire-hud-collapsed' : ''}`}
      aria-label="Ficha técnica de la carta"
    >
      {/* Side-tab toggle attached strictly outside the panel */}
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
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
              {card.manaCost && (
                <div className="grimoire-mana-cost">
                  <ManaCost manaCost={card.manaCost} size={22} />
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

          {/* Clean Price Row */}
          <div className="grimoire-price-row">
            <span className="price-label">PRECIO MERCADO</span>
            <div className="price-value-group">
              <span className="price-pen">{pricePen}</span>
              {card.prices.usd && <span className="price-usd">(${card.prices.usd})</span>}
            </div>
          </div>

          {/* Stats Bar (P/T, Loyalty, EDHREC Rank) */}
          {(hasCombatStats || hasLoyalty || card.edhrecRank) && (
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
              {card.edhrecRank && (
                <div className="metric-chip">
                  <span className="metric-label">EDHREC</span>
                  <span className="metric-val">#{card.edhrecRank.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Rules Text (Oracle) */}
          {card.oracleText && (
            <div className="grimoire-oracle-section">
              <div className="section-eyebrow">Texto de Reglas</div>
              <OracleText text={card.oracleText} symbolSize={16} className="oracle-text-content" />
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
                return (
                  <span
                    key={f.name}
                    className={`format-tag ${isLegal ? 'format-legal' : 'format-not-legal'}`}
                  >
                    <span className={`format-dot ${isLegal ? 'dot-legal' : 'dot-not-legal'}`} />
                    <span>{f.name}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="grimoire-meta-footer">
            <div className="meta-line">
              <span className="meta-k">Colección:</span>
              <span className="meta-v">{card.setName} ({card.setCode.toUpperCase()})</span>
            </div>
            {card.artist && (
              <div className="meta-line">
                <span className="meta-k">Artista:</span>
                <span className="meta-v">{card.artist}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default CardInfoPanel;
