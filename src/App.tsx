import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  RotateCw,
  RefreshCw,
  DollarSign,
  Scale,
  Layers,
  FileText,
  Dices,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Scene, NodeType } from './three';
import { scryfallClient, mapScryfallCardToDomain, ScryfallError } from './services/scryfall';
import type { Card } from './types/card';

// Initial card sample
const DEFAULT_CARD_NAME = 'Black Lotus';

export const App: React.FC = () => {
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    fetchCard(DEFAULT_CARD_NAME);
  }, []);

  // Autocomplete debounce effect
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await scryfallClient.autocomplete(searchQuery);
        setSuggestions(results.slice(0, 6));
      } catch {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for autocomplete
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch card by name
  const fetchCard = async (name: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setShowSuggestions(false);
    try {
      const rawCard = await scryfallClient.getCardNamed(name);
      const domainCard = mapScryfallCardToDomain(rawCard);
      setCurrentCard(domainCard);
      setSelectedNode(null);
    } catch (err: unknown) {
      if (err instanceof ScryfallError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('No se pudo cargar la carta. Intenta con otro nombre.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch random card
  const handleRandomCard = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setShowSuggestions(false);
    try {
      const rawCard = await scryfallClient.getRandomCard();
      const domainCard = mapScryfallCardToDomain(rawCard);
      setCurrentCard(domainCard);
      setSearchQuery(domainCard.name);
      setSelectedNode(null);
    } catch {
      setErrorMessage('Error al obtener carta aleatoria.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchCard(searchQuery.trim());
    }
  };

  const renderNodeDetails = () => {
    if (!selectedNode || !currentCard) return null;

    switch (selectedNode) {
      case 'PRICE':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#f59e0b' }}>
                <DollarSign size={18} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                  VALOR DE MERCADO
                </h3>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scryfall Live Feed</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
              <div className="glass-panel" style={{ padding: '0.65rem 0.85rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>USD (Regular)</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.1rem' }}>
                  {currentCard.prices.usd ? `$${currentCard.prices.usd}` : 'N/D'}
                </p>
              </div>
              <div className="glass-panel" style={{ padding: '0.65rem 0.85rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>EUR (Regular)</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.1rem' }}>
                  {currentCard.prices.eur ? `€${currentCard.prices.eur}` : 'N/D'}
                </p>
              </div>
              {currentCard.prices.usdFoil && (
                <div className="glass-panel" style={{ padding: '0.65rem 0.85rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>USD (Foil)</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.1rem' }}>
                    ${currentCard.prices.usdFoil}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'LEGALITY':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#10b981' }}>
              <Scale size={18} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.03em' }}>
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
              {Object.entries(currentCard.legalities).slice(0, 10).map(([format, status]) => {
                const isLegal = status === 'legal';
                const isRestricted = status === 'restricted';
                return (
                  <div
                    key={format}
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isLegal
                        ? 'rgba(16, 185, 129, 0.12)'
                        : isRestricted
                        ? 'rgba(245, 158, 11, 0.12)'
                        : 'rgba(244, 63, 94, 0.12)',
                      border: `1px solid ${
                        isLegal
                          ? 'rgba(16, 185, 129, 0.25)'
                          : isRestricted
                          ? 'rgba(245, 158, 11, 0.25)'
                          : 'rgba(244, 63, 94, 0.25)'
                      }`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize', fontSize: '0.7rem', color: '#f8fafc' }}>
                      {format}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        color: isLegal ? '#10b981' : isRestricted ? '#f59e0b' : '#f43f5e',
                      }}
                    >
                      {status === 'not_legal' ? 'NO' : status.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'PRINTINGS':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#8b5cf6' }}>
              <Layers size={18} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                EDICIÓN E HISTORIAL
              </h3>
            </div>
            <div className="glass-panel" style={{ padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                  {currentCard.setName}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#c4b5fd',
                    fontWeight: 700,
                  }}
                >
                  {currentCard.setCode.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                Coleccionista #{currentCard.collectorNumber} &bull; Lanzamiento: {currentCard.releasedAt || 'N/D'}
              </p>
            </div>
          </div>
        );

      case 'DETAILS':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#06b6d4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FileText size={18} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                  ATRIBUTOS & LORE
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
                {currentCard.rarity}
              </span>
            </div>
            <div className="glass-panel" style={{ padding: '0.75rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                {currentCard.typeLine} {currentCard.manaCost && `(${currentCard.manaCost})`}
              </span>
              {currentCard.oracleText && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    lineHeight: 1.45,
                    color: '#cbd5e1',
                    marginTop: '0.4rem',
                    paddingTop: '0.4rem',
                    borderTop: '1px solid var(--border-glass)',
                  }}
                >
                  {currentCard.oracleText}
                </p>
              )}
              {currentCard.artist && (
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Ilustración: {currentCard.artist}
                </p>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* 3D Canvas Viewport */}
      <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
        <Scene
          card={currentCard}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          autoRotate={autoRotate}
          resetCameraTrigger={resetCameraTrigger}
        />

        {/* Minimal Floating Top Pill Navbar */}
        <header
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 2rem)',
            maxWidth: '850px',
            padding: '0.5rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            zIndex: 30,
            borderRadius: '9999px',
          }}
        >
          {/* Logo Minimal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.35rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                background: 'linear-gradient(to right, #f8fafc, var(--accent-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              MAGIC 3D
            </span>
          </div>

          {/* Integrated Search Input + Autocomplete */}
          <div ref={searchContainerRef} style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
            <form onSubmit={handleSearchSubmit} style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(10, 11, 16, 0.65)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.75rem',
                  gap: '0.5rem',
                }}
              >
                {isLoading ? (
                  <Loader2 size={16} className="spin" color="var(--accent-cyan)" />
                ) : (
                  <Search size={16} color="var(--text-muted)" />
                )}
                <input
                  type="text"
                  placeholder="Buscar carta (ej. Sol Ring, Black Lotus)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Live Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                  zIndex: 40,
                }}
              >
                {suggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setSearchQuery(name);
                      fetchCard(name);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '0.45rem 0.75rem',
                      textAlign: 'left',
                      color: '#e2e8f0',
                      fontSize: '0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>{name}</span>
                    <ExternalLink size={12} color="var(--text-muted)" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {/* Random Card Button */}
            <button
              onClick={handleRandomCard}
              disabled={isLoading}
              title="Carta aleatoria"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Dices size={16} />
            </button>

            {/* Auto Rotate Toggle */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              title={autoRotate ? 'Pausar rotación' : 'Auto rotar'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: autoRotate ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${autoRotate ? 'var(--accent-cyan)' : 'var(--border-glass)'}`,
                color: autoRotate ? 'var(--accent-cyan)' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <RotateCw size={15} />
            </button>

            {/* Reset Camera */}
            <button
              onClick={() => setResetCameraTrigger((p) => p + 1)}
              title="Reset cámara"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </header>

        {/* Error Toast Notification */}
        {errorMessage && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: '4.75rem',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#fecdd3',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              zIndex: 30,
            }}
          >
            <AlertCircle size={16} color="#f43f5e" />
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              style={{ background: 'none', border: 'none', color: '#fecdd3', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Active Node Detail Card (Bottom Floating Drawer) */}
        {selectedNode && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 2rem)',
              maxWidth: '520px',
              padding: '1rem 1.25rem',
              zIndex: 25,
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.8), 0 0 25px rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>{renderNodeDetails()}</div>
              <button
                onClick={() => setSelectedNode(null)}
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
      </div>
    </div>
  );
};

export default App;
