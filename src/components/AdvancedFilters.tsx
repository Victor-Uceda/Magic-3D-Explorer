import React from 'react';
import { Filter, X, RotateCcw, Check } from 'lucide-react';
import { ManaSymbol } from './ManaSymbol';
import { FilterState } from '../types/filters';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
  activeFilterCount: number;
}

const COLOR_OPTIONS: Array<{ code: string; label: string }> = [
  { code: 'W', label: 'Blanco' },
  { code: 'U', label: 'Azul' },
  { code: 'B', label: 'Negro' },
  { code: 'R', label: 'Rojo' },
  { code: 'G', label: 'Verde' },
  { code: 'C', label: 'Incoloro' },
];

const TYPE_OPTIONS: Array<{ code: string; label: string }> = [
  { code: 'creature', label: 'Criatura' },
  { code: 'instant', label: 'Instantáneo' },
  { code: 'sorcery', label: 'Conjuro' },
  { code: 'artifact', label: 'Artefacto' },
  { code: 'enchantment', label: 'Encantamiento' },
  { code: 'planeswalker', label: 'Planeswalker' },
  { code: 'land', label: 'Tierra' },
];

const FORMAT_OPTIONS: Array<{ code: string; label: string }> = [
  { code: 'commander', label: 'Commander / EDH' },
  { code: 'modern', label: 'Modern' },
  { code: 'standard', label: 'Standard' },
  { code: 'pioneer', label: 'Pioneer' },
  { code: 'legacy', label: 'Legacy' },
  { code: 'pauper', label: 'Pauper' },
];

const RARITY_OPTIONS: Array<{ code: string; label: string; color: string }> = [
  { code: 'common', label: 'Común', color: '#94a3b8' },
  { code: 'uncommon', label: 'Poco común', color: '#cbd5e1' },
  { code: 'rare', label: 'Rara', color: '#d4af37' },
  { code: 'mythic', label: 'Mítica', color: '#f97316' },
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onReset,
  activeFilterCount,
}) => {
  if (!isOpen) return null;

  const toggleColor = (code: string) => {
    const next = filters.colors.includes(code)
      ? filters.colors.filter((c) => c !== code)
      : [...filters.colors, code];
    onFilterChange({ ...filters, colors: next });
  };

  const toggleType = (code: string) => {
    const next = filters.types.includes(code)
      ? filters.types.filter((t) => t !== code)
      : [...filters.types, code];
    onFilterChange({ ...filters, types: next });
  };

  const selectFormat = (code: string) => {
    onFilterChange({
      ...filters,
      format: filters.format === code ? null : code,
    });
  };

  const selectRarity = (code: string) => {
    onFilterChange({
      ...filters,
      rarity: filters.rarity === code ? null : code,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-dropdown)',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} color="var(--gold-primary)" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.03em' }}>
              Filtros de Búsqueda Avanzada
            </h2>
            {activeFilterCount > 0 && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  background: 'var(--gold-primary)',
                  color: '#0f1013',
                  fontWeight: 800,
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Colors */}
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Color de Maná
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              {COLOR_OPTIONS.map((col) => {
                const isSelected = filters.colors.includes(col.code);
                return (
                  <button
                    key={col.code}
                    type="button"
                    onClick={() => toggleColor(col.code)}
                    style={{
                      background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isSelected ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.4rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      color: isSelected ? '#f1f5f9' : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ManaSymbol symbol={`{${col.code}}`} size={16} />
                    <span>{col.label}</span>
                    {isSelected && <Check size={12} color="var(--gold-primary)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Types */}
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tipo de Carta
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              {TYPE_OPTIONS.map((t) => {
                const isSelected = filters.types.includes(t.code);
                return (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => toggleType(t.code)}
                    style={{
                      background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isSelected ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.4rem 0.75rem',
                      color: isSelected ? '#f1f5f9' : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{t.label}</span>
                    {isSelected && <Check size={12} color="var(--gold-primary)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formats */}
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Formato de Juego
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              {FORMAT_OPTIONS.map((fmt) => {
                const isSelected = filters.format === fmt.code;
                return (
                  <button
                    key={fmt.code}
                    type="button"
                    onClick={() => selectFormat(fmt.code)}
                    style={{
                      background: isSelected ? 'rgba(46, 125, 50, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isSelected ? '#4ade80' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.4rem 0.75rem',
                      color: isSelected ? '#4ade80' : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{fmt.label}</span>
                    {isSelected && <Check size={12} color="#4ade80" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rarity */}
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Rareza
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              {RARITY_OPTIONS.map((r) => {
                const isSelected = filters.rarity === r.code;
                return (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() => selectRarity(r.code)}
                    style={{
                      background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isSelected ? r.color : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.4rem 0.75rem',
                      color: isSelected ? r.color : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{r.label}</span>
                    {isSelected && <Check size={12} color={r.color} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            background: 'rgba(15, 16, 19, 0.7)',
          }}
        >
          <button
            type="button"
            onClick={onReset}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.9rem',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s',
            }}
          >
            <RotateCcw size={14} />
            <span>Limpiar</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 1rem',
                color: '#cbd5e1',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onApply();
                onClose();
              }}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #aa8222 100%)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 1.25rem',
                color: '#0f1013',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
              }}
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
