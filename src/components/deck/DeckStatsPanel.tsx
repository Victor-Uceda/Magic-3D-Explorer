import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import type { DeckItem } from '../../pages/DeckBuilderPage';

interface GroupedCategory {
  key: string;
  label: string;
  items: DeckItem['cards'];
  count: number;
}

interface DeckStatsPanelProps {
  deck: DeckItem;
  groupedCategories: GroupedCategory[];
}

export const DeckStatsPanel: React.FC<DeckStatsPanelProps> = ({
  deck,
  groupedCategories,
}) => {
  // Curva de maná (CMC 0, 1, 2, 3, 4, 5, 6, 7+) excluyendo tierras
  const manaCurveData = useMemo(() => {
    const curve = [0, 0, 0, 0, 0, 0, 0, 0];
    for (const item of deck.cards) {
      if (item.card.typeLine.toLowerCase().includes('land')) continue;
      const cmc = Math.min(Math.floor(item.card.cmc || 0), 7);
      curve[cmc] += item.quantity;
    }
    return curve;
  }, [deck.cards]);

  const maxCurveCount = useMemo(() => Math.max(...manaCurveData, 1), [manaCurveData]);

  if (deck.cards.length === 0) return null;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '0.9rem 1.1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          <BarChart3 size={15} color="var(--accent-gold)" />
          <span>Curva de Coste de Maná (CMC)</span>
        </div>

        {/* Categories breakdown pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {groupedCategories.map((g) => (
            <span
              key={g.key}
              style={{
                fontSize: '0.66rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '0.1rem 0.45rem',
                borderRadius: '6px',
              }}
            >
              {g.label}: <strong style={{ color: '#f1f5f9' }}>{g.count}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Histogram Bars */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0.65rem',
          height: '75px',
          paddingTop: '0.4rem',
        }}
      >
        {manaCurveData.map((count, cmc) => {
          const heightPct = Math.round((count / maxCurveCount) * 100);
          return (
            <div
              key={cmc}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: count > 0 ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.2)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {count}
              </span>
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(heightPct, 6)}%`,
                  background:
                    count > 0
                      ? 'linear-gradient(180deg, #c5a059 0%, rgba(197, 160, 89, 0.35) 100%)'
                      : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px',
                  transition: 'height 0.2s ease',
                  boxShadow: count > 0 ? '0 0 10px rgba(197, 160, 89, 0.2)' : 'none',
                }}
              />
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {cmc === 7 ? '7+' : cmc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
