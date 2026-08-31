import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Play,
  Pause,
  Box,
  Eye,
  Share2,
} from 'lucide-react';
import Lighting from '../three/Lighting';
import CameraController from '../three/CameraController';
import ManaParticles from '../three/ManaParticles';
import DeckCascade3D from '../three/DeckCascade3D';
import { ManaCost } from '../components/ManaCost';
import { formatPricePEN } from '../utils/pricing';
import { getDeckShareUrl } from '../utils/sharing';
import type { DeckItem } from './DeckBuilderPage';
import type { Card } from '../types/card';

interface Deck3DPageProps {
  deck: DeckItem;
  onBackToDecks: () => void;
  onInspectCard: (card: Card) => void;
}

export const Deck3DPage: React.FC<Deck3DPageProps> = ({
  deck,
  onBackToDecks,
  onInspectCard,
}) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCascading, setIsCascading] = useState(true);
  const [isSpread, setIsSpread] = useState(true); // Modo Abanico / Cascada por defecto
  const [enableParticles, setEnableParticles] = useState(false); // Sin partículas por defecto

  // Reiniciar carta activa si cambia el mazo
  useEffect(() => {
    setActiveCardIndex(0);
  }, [deck.id]);

  // Expand deck items into single cards array
  const expandedCards = useMemo(() => {
    const list: Card[] = [];
    for (const item of deck.cards) {
      for (let q = 0; q < item.quantity; q++) {
        list.push(item.card);
      }
    }
    return list;
  }, [deck]);

  const totalCardsCount = expandedCards.length;
  const activeCard = expandedCards[activeCardIndex] || expandedCards[0] || null;

  const totalDeckValueUSD = useMemo(() => {
    return deck.cards.reduce((sum, item) => {
      const price = item.card.prices.usd ? parseFloat(item.card.prices.usd) : 0;
      return sum + price * item.quantity;
    }, 0);
  }, [deck]);

  const totalDeckValuePEN = formatPricePEN(totalDeckValueUSD.toFixed(2));

  // Cycling Handlers
  const handleCycleNext = useCallback(() => {
    if (totalCardsCount === 0) return;
    setActiveCardIndex((prev) => (prev + 1) % totalCardsCount);
  }, [totalCardsCount]);

  const handleCyclePrev = useCallback(() => {
    if (totalCardsCount === 0) return;
    setActiveCardIndex((prev) => (prev - 1 + totalCardsCount) % totalCardsCount);
  }, [totalCardsCount]);

  // Keyboard navigation (Arrow keys / Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleCycleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleCyclePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCycleNext, handleCyclePrev]);

  return (
    <div className="card-detail-page-container">
      {/* 3D WebGL Canvas Viewport — Sin base de mesa */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          backgroundImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, rgba(212, 175, 55, 0.12) 0%, rgba(11, 14, 20, 0.82) 50%, rgba(7, 9, 13, 0.96) 100%), url(/sanctum_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Canvas
          shadows={false}
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.4, 9.2], fov: 44 }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
        >
          <Lighting />
          <CameraController autoRotate={false} resetTrigger={0} />
          {enableParticles && <ManaParticles color="#d4af37" />}

          {/* 3D Solitaire Deck Cards with Click Cycling */}
          {totalCardsCount > 0 && (
            <DeckCascade3D
              cards={expandedCards}
              activeCardIndex={activeCardIndex}
              isCascading={isCascading}
              isSpread={isSpread}
              onCycleNext={handleCycleNext}
              onSelectCardDirect={(idx) => setActiveCardIndex(idx)}
            />
          )}
        </Canvas>
      </div>

      {/* Floating Top Header */}
      <header className="viewer-top-bar" role="banner">
        <button
          type="button"
          onClick={onBackToDecks}
          className="viewer-back-btn"
          title="Volver al Constructor de Mazos"
        >
          <ChevronLeft size={16} />
          <span>Volver al Mazo</span>
        </button>

        {/* Deck Title & Info Badge */}
        <div className="viewer-card-title-badge">
          <span className="badge-card-name">{deck.name}</span>
          <span className="badge-separator">•</span>
          <span className="badge-set">{deck.format.toUpperCase()} ({totalCardsCount} cartas)</span>
        </div>

        {/* Market Value Badge & Share */}
        <div className="viewer-quick-actions">
          <button
            type="button"
            className="viewer-action-btn"
            onClick={async () => {
              try {
                const url = getDeckShareUrl(deck);
                await navigator.clipboard.writeText(url);
              } catch {
                // fallback
              }
            }}
            title="Copiar enlace directo para compartir este mazo en 3D"
          >
            <Share2 size={14} />
            <span>Compartir Mazo 3D</span>
          </button>

          <div className="viewer-action-btn" style={{ cursor: 'default' }}>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>
              {totalDeckValuePEN}
            </span>
          </div>
        </div>
      </header>

      {/* Floating Active Card Info Spotlight (Bottom-Left) */}
      {activeCard && (
        <div
          style={{
            position: 'absolute',
            bottom: '5.5rem',
            left: '2rem',
            background: 'rgba(10, 13, 19, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            maxWidth: '340px',
            zIndex: 35,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-gold)', letterSpacing: '0.04em' }}>
              CARTA {activeCardIndex + 1} DE {totalCardsCount}
            </span>
            {activeCard.manaCost && (
              <ManaCost manaCost={activeCard.manaCost} size={15} />
            )}
          </div>

          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
            {activeCard.name}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span>{activeCard.typeLine}</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
              {formatPricePEN(activeCard.prices.usd)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onInspectCard(activeCard)}
            className="deck-btn-primary"
            style={{ marginTop: '0.4rem', justifyContent: 'center', width: '100%', padding: '0.4rem' }}
          >
            <Eye size={13} />
            <span>Examinar Ficha 3D</span>
          </button>
        </div>
      )}

      {/* Floating Bottom Stage Controls with Cycle Buttons */}
      <div className="collector-stage-dock">
        {/* Previous Card */}
        <button
          type="button"
          onClick={handleCyclePrev}
          className="dock-tool-btn"
          title="Carta Anterior (←)"
        >
          <ChevronLeft size={16} />
          <span>Anterior</span>
        </button>

        {/* Next Card (Loop to back) */}
        <button
          type="button"
          onClick={handleCycleNext}
          className="dock-tool-btn dock-tool-btn-active"
          title="Siguiente Carta (Click en el mazo / →)"
        >
          <span>Siguiente</span>
          <ChevronRight size={16} />
        </button>

        <div className="dock-separator" />

        {/* Spread / Stack Toggle */}
        <button
          type="button"
          onClick={() => setIsSpread((prev) => !prev)}
          className={`dock-finish-btn ${isSpread ? 'dock-finish-btn-active' : ''}`}
          title="Alternar entre mazo apilado y abanico en cascada"
        >
          <Layers size={14} />
          <span>{isSpread ? 'Abanico' : 'Pila'}</span>
        </button>

        {isSpread && (
          <button
            type="button"
            onClick={() => setIsCascading((prev) => !prev)}
            className={`dock-finish-btn ${isCascading ? 'dock-finish-btn-active' : ''}`}
            title="Alternar ondulación en cascada"
          >
            {isCascading ? <Pause size={14} /> : <Play size={14} />}
            <span>Onda</span>
          </button>
        )}

        {/* Mana Particles Toggle */}
        <button
          type="button"
          onClick={() => setEnableParticles((prev) => !prev)}
          className={`dock-tool-btn ${enableParticles ? 'dock-tool-btn-active' : ''}`}
          title="Partículas de maná (desactivadas por defecto)"
        >
          <Sparkles size={14} />
          <span>Partículas</span>
        </button>
      </div>

      {/* Interactive Floating Interaction Tip */}
      <div
        style={{
          position: 'absolute',
          bottom: '4.75rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 13, 19, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          padding: '0.25rem 0.85rem',
          fontSize: '0.72rem',
          color: '#cbd5e1',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          zIndex: 35,
        }}
      >
        <Box size={12} color="var(--accent-gold)" />
        <span>Haz clic en la carta frontal del mazo para pasarla atrás (o usa las flechas ← →)</span>
      </div>
    </div>
  );
};

export default Deck3DPage;
