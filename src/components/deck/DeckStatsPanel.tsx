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
  // Curva de maná (CMC 0, 1, 2, 3, 4, 5, 6, 7+)
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
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '0.85rem 1rem',
        margin: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#94a3b8',
          }}
        >
          <BarChart3 size={14} color="var(--accent-gold)" />
          <span>CURVA DE MANÁ (COSTE DE CONJUROS Y CRIATURAS)</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
          {groupedCategories.map((g) => `${g.label}: ${g.count}`).join(' • ')}
        </span>
      </div>

      {/* Histogram Bars */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0.6rem',
          height: '65px',
          paddingTop: '0.5rem',
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
                gap: '0.2rem',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: count > 0 ? '#f1f5f9' : '#475569',
                }}
              >
                {count}
              </span>
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(heightPct, 4)}%`,
                  background:
                    count > 0
                      ? 'linear-gradient(180deg, var(--accent-gold) 0%, rgba(212,175,55,0.3) 100%)'
                      : 'rgba(255,255,255,0.04)',
                  borderRadius: '3px',
                  transition: 'height 0.25s ease',
                }}
              />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>
                {cmc === 7 ? '7+' : cmc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
