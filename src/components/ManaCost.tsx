import React from 'react';
import { ManaSymbol } from './ManaSymbol';

interface ManaCostProps {
  manaCost?: string | null;
  size?: number;
}

export const ManaCost: React.FC<ManaCostProps> = ({ manaCost, size = 18 }) => {
  if (!manaCost) return null;

  // Extract all `{...}` symbols
  const symbols = manaCost.match(/\{[^}]+\}/g);
  if (!symbols || symbols.length === 0) return <span>{manaCost}</span>;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', verticalAlign: 'middle' }}>
      {symbols.map((sym, idx) => (
        <ManaSymbol key={idx} symbol={sym} size={size} />
      ))}
    </span>
  );
};

export default ManaCost;
