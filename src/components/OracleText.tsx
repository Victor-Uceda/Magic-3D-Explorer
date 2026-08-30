import React from 'react';
import { ManaSymbol } from './ManaSymbol';

interface OracleTextProps {
  text?: string | null;
  symbolSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Parses Oracle text and replaces all MTG symbol codes (like {T}, {W}, {0}, {3/U})
 * with real, high-resolution MTG SVG symbols.
 */
export const OracleText: React.FC<OracleTextProps> = ({
  text,
  symbolSize = 16,
  className,
  style,
}) => {
  if (!text) return null;

  // Split by newlines first so each paragraph is handled properly
  const paragraphs = text.split('\n');

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', ...style }}>
      {paragraphs.map((paragraph, pIdx) => {
        // Regex to capture `{...}` tokens
        const parts = paragraph.split(/(\{[^}]+\})/g);

        return (
          <p key={pIdx} style={{ margin: 0, lineHeight: 1.5 }}>
            {parts.map((part, partIdx) => {
              if (part.startsWith('{') && part.endsWith('}')) {
                return (
                  <ManaSymbol
                    key={`${pIdx}-${partIdx}`}
                    symbol={part}
                    size={symbolSize}
                  />
                );
              }
              return <React.Fragment key={`${pIdx}-${partIdx}`}>{part}</React.Fragment>;
            })}
          </p>
        );
      })}
    </div>
  );
};

export default OracleText;
