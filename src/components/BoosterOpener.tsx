import React, { useState, useEffect } from 'react';
import { PackageOpen, Loader2 } from 'lucide-react';
import { BoosterScene, BoosterPhase } from '../three/BoosterScene';
import { generateBoosterPack, BoosterPack } from '../services/boosterSimulator';
import { scryfallClient, ScryfallSet } from '../services/scryfall';
import { BoosterHeader } from './booster/BoosterHeader';
import { BoosterControls } from './booster/BoosterControls';
import { BoosterSummaryModal } from './booster/BoosterSummaryModal';
import { POPULAR_SETS, BOOSTER_ANIMATION } from '../constants/booster';
import { handleApiError } from '../utils/errorHandler';
import type { Card } from '../types/card';



interface BoosterOpenerProps {
  onBackToViewer: () => void;
  onInspectCardInViewer: (card: Card) => void;
  onAddToDeck?: (card: Card) => void;
  onAddAllToDeck?: (cards: Card[]) => void;
}

export const BoosterOpener: React.FC<BoosterOpenerProps> = ({
  onBackToViewer,
  onInspectCardInViewer,
  onAddToDeck,
  onAddAllToDeck,
}) => {
  const [availableSets, setAvailableSets] = useState<{ code: string; name: string }[]>([...POPULAR_SETS]);
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
          const merged = [...POPULAR_SETS] as { code: string; name: string }[];
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
      }, BOOSTER_ANIMATION.OPENING_DELAY_MS);
    } catch (err: unknown) {
      console.error(err);
      const { message } = handleApiError(err, 'No se pudo generar el sobre. Prueba con otro set.');
      setErrorMsg(message);
      setPhase('pack-ready');
      setIsLoadingPack(false);
    }
  };

  // Next card in pack
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

      {/* Header Bar */}
      <BoosterHeader
        onBackToViewer={onBackToViewer}
        selectedSetCode={selectedSetCode}
        onSelectSet={handleSelectSet}
        availableSets={availableSets}
        isOpening={phase === 'opening'}
      />

      {/* Error notification */}
      {/* Error notification */}
      {errorMsg && (
        <div className="booster-error-toast">{errorMsg}</div>
      )}

      {/* Phase 1: Pack Ready HUD */}
      {phase === 'pack-ready' && (
        <div className="booster-pack-ready-hud">
          <button
            type="button"
            onClick={handleOpenPack}
            disabled={isLoadingPack}
            className="booster-open-btn"
          >
            {isLoadingPack ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Generando Sobre...</span>
              </>
            ) : (
              <>
                <span>ABRIR SOBRE</span>
                <PackageOpen size={18} />
              </>
            )}
          </button>
          <span className="booster-open-hint">
            Haz clic para abrir el paquete
          </span>
        </div>
      )}

      {/* Phase 2: Revealing Experience Controls */}
      {phase === 'revealing' && pack && currentBoosterCard && (
        <BoosterControls
          pack={pack}
          currentIndex={currentIndex}
          revealedIndices={revealedIndices}
          currentBoosterCard={currentBoosterCard}
          onJumpToCard={handleJumpToCard}
          onPrevCard={handlePrevCard}
          onNextCard={handleNextCard}
          onToggleCardFlip={() => setIsCurrentCardRevealed((prev) => !prev)}
          onRevealAll={handleRevealAll}
        />
      )}

      {/* Phase 3: Final Summary Grid Modal */}
      {phase === 'finished' && pack && (
        <BoosterSummaryModal
          pack={pack}
          selectedSetName={selectedSetName}
          bestPull={bestPull}
          onResetNewPack={handleResetNewPack}
          onBackToViewer={onBackToViewer}
          onInspectCardInViewer={onInspectCardInViewer}
          onAddToDeck={onAddToDeck}
          onAddAllToDeck={onAddAllToDeck}
        />
      )}
    </div>
  );
};

export default BoosterOpener;
