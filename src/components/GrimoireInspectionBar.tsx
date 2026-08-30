import {
  DollarSign,
  Scale,
  Layers,
  FileText,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { ManaCost } from './ManaCost';
import { OracleText } from './OracleText';
import type { Card } from '../types/card';
import type { NodeType } from '../three';

interface GrimoireInspectionBarProps {
  card: Card | null;
  activeTab: NodeType | null;
  onSelectTab: (tab: NodeType | null) => void;
}

export const GrimoireInspectionBar: React.FC<GrimoireInspectionBarProps> = ({
  card,
  activeTab,
  onSelectTab,
}) => {
  if (!card) return null;

  const usdPrice = card.prices.usd ? parseFloat(card.prices.usd) : null;
  const usdFoilPrice = card.prices.usdFoil ? parseFloat(card.prices.usdFoil) : null;
  const penPrice = usdPrice ? (usdPrice * 3.75).toFixed(2) : null;
  const penFoilPrice = usdFoilPrice ? (usdFoilPrice * 3.75).toFixed(2) : null;

  const legalCount = Object.values(card.legalities).filter((s) => s === 'legal').length;

  const renderDrawerContent = () => {
    switch (activeTab) {
      case 'PRECIO':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#f1f5f9' }}>
                <DollarSign size={18} />
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                  VALOR DE MERCADO & PRECIOS PERÚ
                </h3>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>1 USD ≈ S/ 3.75 PEN</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
              {/* Soles Peruanos (PEN) */}
              <div className="glass-panel" style={{ padding: '0.65rem 0.85rem' }}>
                <span style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase' }}>
                  SOLES (PEN)
                </span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.1rem' }}>
                  {penPrice ? `S/ ${penPrice}` : 'N/D'}
                </p>
              </div>

              {/* Dólares (USD) */}
              <div className="glass-panel" style={{ padding: '0.65rem 0.85rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>USD (Normal)</span>
                <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.1rem' }}>
                  {card.prices.usd ? `$${card.prices.usd}` : 'N/D'}
                </p>
              </div>

              {/* Soles Foil (Brillante) */}
              {penFoilPrice && (
                <div className="glass-panel" style={{ padding: '0.65rem 0.85rem' }}>
                  <span style={{ fontSize: '0.65rem', color: '#cbd5e1', textTransform: 'uppercase' }}>SOLES (Foil)</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.1rem' }}>
                    S/ {penFoilPrice}
                  </p>
                </div>
              )}

              {/* USD Foil */}
              {usdFoilPrice && (
                <div className="glass-panel" style={{ padding: '0.65rem 0.85rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>USD (Foil)</span>
                  <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.1rem' }}>
                    ${card.prices.usdFoil}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'LEGALIDAD':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#6b8f71' }}>
              <Scale size={18} />
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                LEGALIDAD EN FORMATOS
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
                gap: '0.4rem',
                maxHeight: '150px',
                overflowY: 'auto',
              }}
            >
              {Object.entries(card.legalities).slice(0, 12).map(([format, status]) => {
                const isLegal = status === 'legal';
                const isRestricted = status === 'restricted';
                return (
                  <div
                    key={format}
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize', fontSize: '0.7rem', color: '#f1f5f9' }}>
                      {format}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        color: isLegal ? '#6b8f71' : isRestricted ? '#b49650' : '#a05050',
                      }}
                    >
                      {status === 'not_legal' ? 'NO LEGAL' : status === 'banned' ? 'PROHIBIDA' : status.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'EDICIONES':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#f1f5f9' }}>
              <Layers size={18} />
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                EDICIÓN Y COLECCIÓN
              </h3>
            </div>
            <div className="glass-panel" style={{ padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-sans)' }}>
                  {card.setName}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border-subtle)',
                    color: '#f1f5f9',
                    fontWeight: 700,
                  }}
                >
                  {card.setCode.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                N° Coleccionista: #{card.collectorNumber} &bull; Lanzamiento: {card.releasedAt || 'N/D'}
              </p>
            </div>
          </div>
        );

      case 'DETALLES':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FileText size={18} />
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                  ATRIBUTOS Y TEXTO
                </h3>
              </div>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#cbd5e1', letterSpacing: '0.04em' }}>
                {card.rarity}
              </span>
            </div>
            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9', fontFamily: 'var(--font-serif)' }}>
                  {card.typeLine}
                </span>
                {card.manaCost && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.45rem', borderRadius: '9999px' }}>
                    <ManaCost manaCost={card.manaCost} size={22} />
                  </div>
                )}
              </div>
              {card.oracleText && (
                <div
                  style={{
                    fontSize: '0.86rem',
                    lineHeight: 1.55,
                    color: '#e2e8f0',
                    marginTop: '0.55rem',
                    paddingTop: '0.55rem',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <OracleText text={card.oracleText} symbolSize={22} />
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.55rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {card.artist ? (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Ilustrador: {card.artist}
                  </p>
                ) : <span />}
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  Pasa el cursor sobre los símbolos para ampliar
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 2rem)',
        maxWidth: '650px',
        zIndex: 35,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {/* Expanded Detail Drawer */}
      {activeTab && (
        <div
          className="glass-panel"
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-dropdown)',
            border: '1px solid var(--border-subtle)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>{renderDrawerContent()}</div>
            <button
              onClick={() => onSelectTab(null)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginLeft: '0.75rem',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Fixed 2D UI Guide Arrows Leading to Buttons (Stationary, does not move with 3D camera) */}
      {!activeTab && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.68rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-fantasy)',
            fontWeight: 700,
            marginBottom: '-2px',
            animation: 'bounceSubtle 2.2s infinite ease-in-out',
            userSelect: 'none',
          }}
        >
          <ChevronDown size={14} style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
          <span>Toca los botones para inspeccionar</span>
          <ChevronDown size={14} style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
        </div>
      )}

      {/* Modern Collector Dock with Distinct Interactive Buttons */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
          gap: '0.5rem',
        }}
      >
        {/* PRECIO Button */}
        <button
          type="button"
          onClick={() => onSelectTab(activeTab === 'PRECIO' ? null : 'PRECIO')}
          style={{
            flex: 1,
            background: activeTab === 'PRECIO' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${activeTab === 'PRECIO' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
            borderRadius: '9999px',
            padding: '0.55rem 0.75rem',
            color: '#f1f5f9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.4rem',
            transition: 'all 0.18s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = activeTab === 'PRECIO' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.background = activeTab === 'PRECIO' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <DollarSign size={15} color="#cbd5e1" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.03em' }}>PRECIO</span>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                {penPrice ? `S/ ${penPrice}` : 'N/D'}
              </span>
            </div>
          </div>
          <ChevronUp size={13} color="#94a3b8" style={{ transform: activeTab === 'PRECIO' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* LEGALIDAD Button */}
        <button
          type="button"
          onClick={() => onSelectTab(activeTab === 'LEGALIDAD' ? null : 'LEGALIDAD')}
          style={{
            flex: 1,
            background: activeTab === 'LEGALIDAD' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${activeTab === 'LEGALIDAD' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
            borderRadius: '9999px',
            padding: '0.55rem 0.75rem',
            color: '#f1f5f9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.4rem',
            transition: 'all 0.18s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = activeTab === 'LEGALIDAD' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.background = activeTab === 'LEGALIDAD' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Scale size={15} color="#cbd5e1" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.03em' }}>FORMATOS</span>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                {legalCount} Legal
              </span>
            </div>
          </div>
          <ChevronUp size={13} color="#94a3b8" style={{ transform: activeTab === 'LEGALIDAD' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* EDICION Button */}
        <button
          type="button"
          onClick={() => onSelectTab(activeTab === 'EDICIONES' ? null : 'EDICIONES')}
          style={{
            flex: 1,
            background: activeTab === 'EDICIONES' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${activeTab === 'EDICIONES' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
            borderRadius: '9999px',
            padding: '0.55rem 0.75rem',
            color: '#f1f5f9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.4rem',
            transition: 'all 0.18s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = activeTab === 'EDICIONES' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.background = activeTab === 'EDICIONES' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Layers size={15} color="#cbd5e1" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.03em' }}>EDICIÓN</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                {card.setCode.toUpperCase()}
              </span>
            </div>
          </div>
          <ChevronUp size={13} color="#94a3b8" style={{ transform: activeTab === 'EDICIONES' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* DETALLES Button */}
        <button
          type="button"
          onClick={() => onSelectTab(activeTab === 'DETALLES' ? null : 'DETALLES')}
          style={{
            flex: 1,
            background: activeTab === 'DETALLES' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${activeTab === 'DETALLES' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
            borderRadius: '9999px',
            padding: '0.55rem 0.75rem',
            color: '#f1f5f9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.4rem',
            transition: 'all 0.18s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = activeTab === 'DETALLES' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.background = activeTab === 'DETALLES' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <FileText size={15} color="#cbd5e1" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.03em' }}>REGLAS</span>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                {card.rarity}
              </span>
            </div>
          </div>
          <ChevronUp size={13} color="#94a3b8" style={{ transform: activeTab === 'DETALLES' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </div>
    </div>
  );
};

export default GrimoireInspectionBar;
