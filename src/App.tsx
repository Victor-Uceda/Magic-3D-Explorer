import React, { useState } from 'react';
import {
  Box,
  RotateCw,
  RefreshCw,
  DollarSign,
  Scale,
  Layers,
  FileText,
  Info,
  X,
} from 'lucide-react';
import { Scene, NodeType } from './three';
import type { Card } from './types/card';

// Sample Demo Card for Phase 2 testing
const SAMPLE_CARD: Card = {
  id: '0001498b-29a4-44b8-89f5-3094977464f6',
  name: 'Black Lotus',
  manaCost: '{0}',
  cmc: 0,
  typeLine: 'Artifact',
  oracleText: '{T}, Sacrifice Black Lotus: Add three mana of any one color.',
  rarity: 'rare',
  setName: 'Limited Edition Alpha',
  setCode: 'lea',
  collectorNumber: '232',
  artist: 'Christopher Rush',
  imageUris: {
    small: 'https://cards.scryfall.io/small/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    normal: 'https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    large: 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    png: 'https://cards.scryfall.io/png/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.png',
    artCrop: 'https://cards.scryfall.io/art_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    borderCrop: 'https://cards.scryfall.io/border_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
  },
  prices: {
    usd: '42000.00',
    usdFoil: null,
    eur: '38500.00',
    eurFoil: null,
  },
  legalities: {
    standard: 'not_legal',
    modern: 'not_legal',
    legacy: 'banned',
    vintage: 'restricted',
    commander: 'banned',
    pioneer: 'not_legal',
    pauper: 'not_legal',
  },
  releasedAt: '1993-08-05',
};

export const App: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0);

  const renderNodeDetails = () => {
    if (!selectedNode) return null;

    switch (selectedNode) {
      case 'PRICE':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
              <DollarSign size={20} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Precios de Mercado (Scryfall)</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
              <div className="glass-panel" style={{ padding: '0.85rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>USD Regular</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
                  {SAMPLE_CARD.prices.usd ? `$${SAMPLE_CARD.prices.usd}` : 'N/D'}
                </p>
              </div>
              <div className="glass-panel" style={{ padding: '0.85rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EUR Regular</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
                  {SAMPLE_CARD.prices.eur ? `€${SAMPLE_CARD.prices.eur}` : 'N/D'}
                </p>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              * Precios actualizados en tiempo real mediante Scryfall API.
            </p>
          </div>
        );

      case 'LEGALITY':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
              <Scale size={20} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Legalidad por Formato</h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.5rem',
                maxHeight: '180px',
                overflowY: 'auto',
              }}
            >
              {Object.entries(SAMPLE_CARD.legalities).map(([format, status]) => {
                const isLegal = status === 'legal';
                const isRestricted = status === 'restricted';
                return (
                  <div
                    key={format}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isLegal
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isRestricted
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(244, 63, 94, 0.15)',
                      border: `1px solid ${
                        isLegal
                          ? 'rgba(16, 185, 129, 0.3)'
                          : isRestricted
                          ? 'rgba(245, 158, 11, 0.3)'
                          : 'rgba(244, 63, 94, 0.3)'
                      }`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 600 }}>
                      {format}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: isLegal ? '#10b981' : isRestricted ? '#f59e0b' : '#f43f5e',
                      }}
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'PRINTINGS':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6' }}>
              <Layers size={20} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ediciones e Impresiones</h3>
            </div>
            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                {SAMPLE_CARD.setName} ({SAMPLE_CARD.setCode.toUpperCase()})
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Número de Coleccionista: #{SAMPLE_CARD.collectorNumber} &bull; Lanzamiento:{' '}
                {SAMPLE_CARD.releasedAt}
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              En la Fase 7 se cargarán todas las reimpresiones históricas e ilustraciones alternativas.
            </span>
          </div>
        );

      case 'DETAILS':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4' }}>
              <FileText size={20} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Detalles de la Carta</h3>
            </div>
            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{SAMPLE_CARD.typeLine}</span>
                <span style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Rareza: {SAMPLE_CARD.rarity.toUpperCase()}
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  color: '#e2e8f0',
                  fontStyle: 'italic',
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '0.5rem',
                }}
              >
                &ldquo;{SAMPLE_CARD.oracleText}&rdquo;
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Artista: {SAMPLE_CARD.artist}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 3D Canvas Full Background Viewport */}
      <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
        <Scene
          card={SAMPLE_CARD}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          autoRotate={autoRotate}
          resetCameraTrigger={resetCameraTrigger}
        />

        {/* Floating HUD - Top Header */}
        <header
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1.5rem',
            right: '1.5rem',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Box size={20} color="#ffffff" />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  background: 'linear-gradient(to right, #f8fafc, var(--accent-cyan))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                MAGIC 3D EXPLORER
              </h1>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Fase 2: Escena 3D & Nodos Interactivos
              </span>
            </div>
          </div>

          {/* 3D Scene Controls HUD */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="glass-card"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                color: autoRotate ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderColor: autoRotate ? 'var(--accent-cyan)' : 'var(--border-glass)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              title="Alternar rotación automática de la cámara"
            >
              <RotateCw size={14} className={autoRotate ? 'spin' : ''} />
              <span>{autoRotate ? 'Pausar Rotación' : 'Auto Rotación'}</span>
            </button>

            <button
              onClick={() => setResetCameraTrigger((prev) => prev + 1)}
              className="glass-card"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              title="Restablecer posición de la cámara"
            >
              <RefreshCw size={14} />
              <span>Reset Cámara</span>
            </button>
          </div>
        </header>

        {/* Instructions Overlay Badge */}
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: selectedNode ? '280px' : '1.5rem',
            left: '1.5rem',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            zIndex: 10,
            transition: 'bottom 0.3s ease',
          }}
        >
          <Info size={16} color="var(--accent-cyan)" />
          <span>Arrastra con el mouse para rotar en 3D &bull; Scroll para zoom &bull; Clic en los orbes para ver datos</span>
        </div>

        {/* Selected Info Node Panel (Bottom Drawer) */}
        {selectedNode && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: '1.5rem',
              left: '1.5rem',
              right: '1.5rem',
              maxWidth: '600px',
              margin: '0 auto',
              padding: '1.25rem 1.5rem',
              zIndex: 20,
              boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 25px rgba(99, 102, 241, 0.3)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>{renderNodeDetails()}</div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  marginLeft: '1rem',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
