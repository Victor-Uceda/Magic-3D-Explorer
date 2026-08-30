import React, { useState, useEffect } from 'react';
import {
  PackageOpen,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Repeat,
  ChevronLeft,
  Loader2,
  DollarSign,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import { BoosterScene, BoosterPhase } from '../three/BoosterScene';
import { generateBoosterPack, BoosterPack } from '../services/boosterSimulator';
import { scryfallClient, ScryfallSet } from '../services/scryfall';
import type { Card } from '../types/card';

// Curated list of premier booster sets for quick selection
const POPULAR_SETS: { code: string; name: string }[] = [
  { code: 'mh3', name: 'Modern Horizons 3' },
  { code: 'fdn', name: 'Foundations' },
  { code: 'otj', name: 'Outlaws of Thunder Junction' },
  { code: 'mkm', name: 'Murders at Karlov Manor' },
  { code: 'lci', name: 'The Lost Caverns of Ixalan' },
  { code: 'woe', name: 'Wilds of Eldraine' },
  { code: 'mom', name: 'March of the Machine' },
  { code: 'neo', name: 'Kamigawa: Neon Dynasty' },
  { code: 'mh2', name: 'Modern Horizons 2' },
  { code: '2xm', name: 'Double Masters' },
];

interface BoosterOpenerProps {
  onBackToViewer: () => void;
  onInspectCardInViewer: (card: Card) => void;
}

export const BoosterOpener: React.FC<BoosterOpenerProps> = ({
  onBackToViewer,
  onInspectCardInViewer,
}) => {
  const [availableSets, setAvailableSets] = useState<{ code: string; name: string }[]>(POPULAR_SETS);
  const [selectedSetCode, setSelectedSetCode] = useState<string>('mh3');
  const [selectedSetName, setSelectedSetName] = useState<string>('Modern Horizons 3');
  
  const [phase, setPhase] = useState<BoosterPhase>('pack-ready');
  const [pack, setPack] = useState<BoosterPack | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [isCurrentCardRevealed, setIsCurrentCardRevealed] = useState<boolean>(true);
  const [isLoadingPack, setIsLoadingPack] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch full list of eligible sets on mount
  useEffect(() => {
    let isMounted = true;
    const loadSets = async () => {
      try {
        const rawSets: ScryfallSet[] = await scryfallClient.getSets();
        if (isMounted && rawSets.length > 0) {
          const formatted = rawSets
            .map((s) => ({ code: s.code, name: s.name }))
            .filter((s) => s.name && s.code);
          const merged = [...POPULAR_SETS];
          formatted.forEach((item) => {
            if (!merged.some((m) => m.code === item.code)) {
              merged.push(item);
            }
          });
          setAvailableSets(merged);
        }
      } catch {
        // Keep popular sets fallback
      }
    };
    loadSets();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle set change
  const handleSelectSet = (code: string) => {
    setSelectedSetCode(code);
    const found = availableSets.find((s) => s.code === code);
    if (found) setSelectedSetName(found.name);
    setPhase('pack-ready');
    setPack(null);
    setCurrentIndex(0);
    setRevealedIndices(new Set());
    setIsCurrentCardRevealed(true);
  };

  // Open Booster sequence
  const handleOpenPack = async () => {
    if (isLoadingPack) return;
    setIsLoadingPack(true);
    setErrorMsg(null);

    try {
      const generatedPack = await generateBoosterPack(selectedSetCode, selectedSetName);
      setPack(generatedPack);
      
      setPhase('opening');
      setTimeout(() => {
        setPhase('revealing');
        setCurrentIndex(0);
        setRevealedIndices(new Set([0]));
        setIsCurrentCardRevealed(true);
        setIsLoadingPack(false);
      }, 1100);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('No se pudo generar el sobre. Prueba con otro set.');
      setPhase('pack-ready');
      setIsLoadingPack(false);
    }
  };

  // Next card in pack (automatically shows face of card)
  const handleNextCard = () => {
    if (!pack) return;

    if (currentIndex + 1 < pack.cards.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsCurrentCardRevealed(true);
      setRevealedIndices((prev) => new Set(prev).add(nextIdx));
    } else {
      setPhase('finished');
    }
  };

  // Previous card in pack
  const handlePrevCard = () => {
    if (!pack || currentIndex === 0) return;
    const prevIdx = currentIndex - 1;
    setCurrentIndex(prevIdx);
    setIsCurrentCardRevealed(true);
  };

  // Jump to specific card from progress dots
  const handleJumpToCard = (idx: number) => {
    if (!pack) return;
    setCurrentIndex(idx);
    setIsCurrentCardRevealed(true);
    setRevealedIndices((prev) => new Set(prev).add(idx));
  };

  // Reveal All cards instantly and jump to summary
  const handleRevealAll = () => {
    if (!pack) return;
    const allSet = new Set<number>();
    for (let i = 0; i < pack.cards.length; i++) allSet.add(i);
    setRevealedIndices(allSet);
    setIsCurrentCardRevealed(true);
    setPhase('finished');
  };

  // Reset to open a new pack
  const handleResetNewPack = () => {
    setPhase('pack-ready');
    setPack(null);
    setCurrentIndex(0);
    setRevealedIndices(new Set());
    setIsCurrentCardRevealed(true);
  };

  const currentBoosterCard = pack?.cards[currentIndex];
  const currentCardRarity = currentBoosterCard?.rarity || 'common';
  const usd = currentBoosterCard?.card.prices.usd ? parseFloat(currentBoosterCard.card.prices.usd) : null;
  const pen = usd ? (usd * 3.75).toFixed(2) : null;

  // Find best pull for summary
  const bestPull = pack?.cards.reduce((max, item) => {
    const val = item.card.prices.usd ? parseFloat(item.card.prices.usd) : 0;
    const maxVal = max?.card.prices.usd ? parseFloat(max.card.prices.usd) : 0;
    return val > maxVal ? item : max;
  }, pack?.cards[0]);

  return (
    <div className="card-detail-page-container booster-page-container">
      {/* 3D Booster Scene */}
      <BoosterScene
        phase={phase}
        setName={selectedSetName}
        setCode={selectedSetCode}
        cards={pack?.cards || []}
        currentIndex={currentIndex}
        isCurrentCardRevealed={isCurrentCardRevealed}
        onOpenPack={handleOpenPack}
        onRevealCurrentCard={() => setIsCurrentCardRevealed((prev) => !prev)}
      />

      {/* Booster Navigation Header (Anchored Fixed Bar at top - no overlaps) */}
      <header className="viewer-top-bar" role="banner">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBackToViewer}
          className="viewer-back-btn"
          title="Volver al Catálogo"
        >
          <ChevronLeft size={16} />
          <span>Volver</span>
        </button>

        {/* Set Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '420px', margin: '0 1rem', pointerEvents: 'auto' }}>
          <PackageOpen size={16} color="var(--accent-gold)" />
          <select
            value={selectedSetCode}
            onChange={(e) => handleSelectSet(e.target.value)}
            disabled={phase === 'opening'}
            style={{
              width: '100%',
              background: 'rgba(14, 17, 24, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#f8fafc',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {availableSets.map((s) => (
              <option key={s.code} value={s.code} style={{ background: '#141722', color: '#f8fafc' }}>
                {s.name} [{s.code.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>

        {/* Logo Title */}
        <div className="viewer-card-title-badge">
          <span className="badge-card-name">MAGIC 3D</span>
          <span className="badge-separator">•</span>
          <span className="badge-set">SOBRES</span>
        </div>
      </header>

      {/* Error notification */}
      {errorMsg && (
        <div
          style={{
            position: 'absolute',
            top: '4.75rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 68, 68, 0.25)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#fca5a5',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            zIndex: 45,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Phase 1: Pack Ready HUD */}
      {phase === 'pack-ready' && (
        <div
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            zIndex: 35,
          }}
        >
          <button
            onClick={handleOpenPack}
            disabled={isLoadingPack}
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #ca8a04 100%)',
              color: '#0f172a',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.75rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 8px 30px rgba(212, 175, 55, 0.4)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(212, 175, 55, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(212, 175, 55, 0.4)';
            }}
          >
            {isLoadingPack ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Generando Sobre...</span>
              </>
            ) : (
              <>
                <PackageOpen size={20} />
                <span>ABRIR SOBRE (15 CARTAS)</span>
              </>
            )}
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            Haz clic para abrir el paquete
          </span>
        </div>
      )}

      {/* Phase 2: Revealing Experience */}
      {phase === 'revealing' && pack && currentBoosterCard && (
        <>
          {/* Top Card Progress Dots */}
          <div
            style={{
              position: 'absolute',
              top: '4.6rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              zIndex: 35,
              background: 'rgba(15, 17, 23, 0.6)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {pack.cards.map((c, i) => {
              const isCurrent = i === currentIndex;
              const isRev = revealedIndices.has(i);
              const dotColor =
                c.rarity === 'mythic'
                  ? '#d97706'
                  : c.rarity === 'rare'
                  ? '#d4af37'
                  : c.rarity === 'uncommon'
                  ? '#94a3b8'
                  : '#475569';

              return (
                <div
                  key={i}
                  onClick={() => handleJumpToCard(i)}
                  style={{
                    width: isCurrent ? '18px' : '7px',
                    height: '7px',
                    borderRadius: '9999px',
                    background: isCurrent ? '#f1f5f9' : isRev ? dotColor : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  title={`Carta ${i + 1}: ${c.card.name} (${c.rarity})`}
                />
              );
            })}
          </div>

          {/* Right Floating Card Details */}
          <div
            style={{
              position: 'absolute',
              top: '7.5rem',
              right: '1.5rem',
              width: '260px',
              zIndex: 35,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div
              style={{
                background: 'rgba(15, 17, 23, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '0.75rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color:
                      currentCardRarity === 'mythic'
                        ? '#d97706'
                        : currentCardRarity === 'rare'
                        ? '#d4af37'
                        : currentCardRarity === 'uncommon'
                        ? '#94a3b8'
                        : '#cbd5e1',
                  }}
                >
                  {currentCardRarity.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f1f5f9' }}>
                  {pen ? `S/ ${pen}` : (usd ? `$${usd}` : 'N/D')}
                </span>
              </div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.3 }}>
                {currentBoosterCard.card.name}
              </h4>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {currentBoosterCard.card.typeLine}
              </p>
            </div>
          </div>

          {/* Bottom Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '1.75rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 35,
              background: 'rgba(15, 17, 23, 0.75)',
              backdropFilter: 'blur(10px)',
              padding: '0.45rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Previous Card Button */}
            {currentIndex > 0 && (
              <button
                onClick={handlePrevCard}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  borderRadius: '9999px',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <ArrowLeft size={14} />
                <span>Anterior</span>
              </button>
            )}

            {/* Flip Card Button */}
            <button
              onClick={() => setIsCurrentCardRevealed((prev) => !prev)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                borderRadius: '9999px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              title="Voltear carta (Ver anverso/reverso)"
            >
              <Repeat size={14} />
              <span>Voltear</span>
            </button>

            {/* Next / Finish Button */}
            <button
              onClick={handleNextCard}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #ca8a04 100%)',
                color: '#0f172a',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.5rem 1.25rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <span>{currentIndex + 1 === 15 ? 'Ver Resumen Final' : `Siguiente (${currentIndex + 1}/15)`}</span>
              <ArrowRight size={15} />
            </button>

            {/* Instant Reveal All Button */}
            <button
              onClick={handleRevealAll}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'var(--text-muted)',
                borderRadius: '9999px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f1f5f9';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              Ver Todo
            </button>
          </div>
        </>
      )}

      {/* Phase 3: Final Summary Grid Modal */}
      {phase === 'finished' && pack && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            background: 'rgba(10, 12, 16, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            overflowY: 'auto',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          {/* Header Summary Banner */}
          <div
            style={{
              maxWidth: '1000px',
              width: '100%',
              margin: '0 auto 1.25rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              paddingBottom: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} color="#22c55e" />
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9' }}>
                  Sobre Abierto: {selectedSetName}
                </h2>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                15 cartas obtenidas • Haz clic en cualquier carta para cargarla en el visor 3D
              </span>
            </div>

            {/* Total Estimated Value Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid #d4af37',
                  borderRadius: '10px',
                  padding: '0.5rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <DollarSign size={18} color="#d4af37" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 600 }}>VALOR TOTAL ESTIMADO</span>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
                    ${pack.totalValueUsd.toFixed(2)} USD <span style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>(S/ {pack.totalValuePen.toFixed(2)})</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleResetNewPack}
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #ca8a04 100%)',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <RotateCcw size={15} />
                <span>Otro Sobre</span>
              </button>

              <button
                onClick={onBackToViewer}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#f1f5f9',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '9999px',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Volver al Visor 3D
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              maxWidth: '1000px',
              width: '100%',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '1rem',
              paddingBottom: '2rem',
            }}
          >
            {pack.cards.map((item, idx) => {
              const usdVal = item.card.prices.usd ? parseFloat(item.card.prices.usd) : null;
              const penVal = usdVal ? (usdVal * 3.75).toFixed(2) : null;
              const imgUrl = item.card.imageUris.normal || item.card.imageUris.small;
              const isBest = bestPull?.card.id === item.card.id;

              return (
                <div
                  key={`${item.card.id}-${idx}`}
                  onClick={() => onInspectCardInViewer(item.card)}
                  style={{
                    background: 'rgba(15, 17, 23, 0.65)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${isBest ? '#eab308' : 'rgba(255, 255, 255, 0.12)'}`,
                    borderRadius: '10px',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#d4af37';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = isBest ? '#eab308' : 'rgba(255, 255, 255, 0.12)';
                  }}
                  title="Haz clic para ver esta carta en 3D"
                >
                  {isBest && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#eab308',
                        color: '#0f172a',
                        borderRadius: '4px',
                        padding: '0.15rem 0.4rem',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        zIndex: 2,
                      }}
                    >
                      <Trophy size={11} />
                      <span>TOP PULL</span>
                    </div>
                  )}

                  <img
                    src={imgUrl}
                    alt={item.card.name}
                    style={{
                      width: '100%',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                    }}
                    loading="lazy"
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color:
                            item.rarity === 'mythic'
                              ? '#d97706'
                              : item.rarity === 'rare'
                              ? '#d4af37'
                              : item.rarity === 'uncommon'
                              ? '#94a3b8'
                              : 'var(--text-muted)',
                        }}
                      >
                        {item.rarity}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f1f5f9' }}>
                        {penVal ? `S/ ${penVal}` : (usdVal ? `$${usdVal}` : 'N/D')}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f1f5f9', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.card.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoosterOpener;
