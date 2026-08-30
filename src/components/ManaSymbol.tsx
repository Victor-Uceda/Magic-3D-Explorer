import React, { useState } from 'react';

interface ManaSymbolProps {
  symbol: string; // e.g. "{T}", "{W}", "{2}", "{U/B}"
  size?: number;
  enableZoom?: boolean;
}

// Spanish description of MTG symbols
function getSymbolDescription(rawCode: string, symbol: string): string {
  switch (rawCode) {
    case 'T':
    case 'TAP':
      return 'Girar (Activar habilidad de la carta)';
    case 'UNTAP':
    case 'Q':
      return 'Enderezar (Activar)';
    case 'W':
      return '1 Maná Blanco (Llanura)';
    case 'U':
      return '1 Maná Azul (Isla)';
    case 'B':
      return '1 Maná Negro (Pantano)';
    case 'R':
      return '1 Maná Rojo (Montaña)';
    case 'G':
      return '1 Maná Verde (Bosque)';
    case 'C':
      return '1 Maná Incoloro';
    case 'X':
      return 'Coste de maná variable (X)';
    case 'E':
      return 'Contador de Energía';
    default:
      if (!isNaN(Number(rawCode))) {
        return `${rawCode} Maná Genérico`;
      }
      return `Símbolo de maná ${symbol}`;
  }
}

export const ManaSymbol: React.FC<ManaSymbolProps> = ({ symbol, size = 18, enableZoom = true }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Clean the symbol: "{W/U}" -> "WU", "{T}" -> "T", "{0}" -> "0"
  const rawCode = symbol.replace(/[{}]/g, '').trim().toUpperCase();
  const scryfallCode = rawCode.replace(/\//g, '');
  const svgUrl = `https://svgs.scryfall.io/card-symbols/${scryfallCode}.svg`;
  const description = getSymbolDescription(rawCode, symbol);

  // Fallback styling for known mana colors
  const getFallbackStyle = (code: string): React.CSSProperties => {
    switch (code) {
      case 'W':
        return { backgroundColor: '#fef3c7', color: '#78350f', border: '1px solid #d97706' };
      case 'U':
        return { backgroundColor: '#bfdbfe', color: '#1e3a8a', border: '1px solid #3b82f6' };
      case 'B':
        return { backgroundColor: '#334155', color: '#f8fafc', border: '1px solid #475569' };
      case 'R':
        return { backgroundColor: '#fecaca', color: '#991b1b', border: '1px solid #ef4444' };
      case 'G':
        return { backgroundColor: '#bbf7d0', color: '#14532d', border: '1px solid #22c55e' };
      case 'T':
      case 'TAP':
        return { backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #64748b' };
      case 'C':
        return { backgroundColor: '#cbd5e1', color: '#1e293b', border: '1px solid #94a3b8' };
      default:
        return { backgroundColor: '#334155', color: '#f8fafc', border: '1px solid #64748b' };
    }
  };

  const zoomStyle: React.CSSProperties = enableZoom && isHovered
    ? {
        transform: 'scale(2.2)',
        zIndex: 50,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.75)',
        cursor: 'zoom-in',
      }
    : {
        transform: 'scale(1)',
        zIndex: 1,
      };

  if (imageError) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          fontSize: `${Math.max(9, Math.floor(size * 0.65))}px`,
          fontWeight: 800,
          lineHeight: 1,
          verticalAlign: 'middle',
          margin: '0 2px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          position: 'relative',
          ...getFallbackStyle(rawCode),
          ...zoomStyle,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={description}
      >
        {rawCode === 'T' ? '⟳' : rawCode}
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        verticalAlign: '-3px',
        margin: '0 2px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={svgUrl}
        alt={symbol}
        title={description}
        onError={() => setImageError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'block',
          borderRadius: '50%',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
          transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease',
          ...zoomStyle,
        }}
        loading="lazy"
      />
    </span>
  );
};

export default ManaSymbol;
