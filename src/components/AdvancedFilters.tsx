/**
 * AdvancedFilters — Modal de Filtros de Búsqueda Avanzada
 *
 * Refactorizado para:
 * 1. Usar FilterSection genérico en lugar de 4 bloques repetidos
 * 2. Importar opciones de filtro desde constants/filters.ts
 * 3. Migrar inline styles a clases CSS en modals.css
 */

import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { ManaSymbol } from './ManaSymbol';
import { FilterSection, FilterOption } from './filters/FilterSection';
import { COLOR_OPTIONS, TYPE_OPTIONS, FORMAT_OPTIONS, RARITY_OPTIONS } from '../constants/filters';
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
    <div className="advanced-filters-overlay" onClick={onClose}>
      <div
        className="glass-panel advanced-filters-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="advanced-filters-header">
          <div className="advanced-filters-title-group">
            <Filter size={18} color="var(--gold-primary)" />
            <h2 className="advanced-filters-title">Filtros de Búsqueda Avanzada</h2>
            {activeFilterCount > 0 && (
              <span className="advanced-filters-count">{activeFilterCount}</span>
            )}
          </div>
          <button onClick={onClose} className="advanced-filters-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="advanced-filters-body">
          <FilterSection
            title="Color de Maná"
            options={COLOR_OPTIONS}
            selected={filters.colors}
            onToggle={toggleColor}
            renderPrefix={(opt: FilterOption) => (
              <ManaSymbol symbol={`{${opt.code}}`} size={16} />
            )}
          />

          <FilterSection
            title="Tipo de Carta"
            options={TYPE_OPTIONS}
            selected={filters.types}
            onToggle={toggleType}
          />

          <FilterSection
            title="Formato de Juego"
            options={FORMAT_OPTIONS}
            selected={filters.format}
            onToggle={selectFormat}
            activeColor="#10b981"
          />

          <FilterSection
            title="Rareza"
            options={RARITY_OPTIONS}
            selected={filters.rarity}
            onToggle={selectRarity}
          />
        </div>

        {/* Footer actions */}
        <div className="advanced-filters-footer">
          <button type="button" onClick={onReset} className="advanced-filters-reset-btn">
            <RotateCcw size={14} />
            <span>Limpiar</span>
          </button>

          <div className="advanced-filters-actions">
            <button type="button" onClick={onClose} className="advanced-filters-cancel-btn">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onApply();
                onClose();
              }}
              className="advanced-filters-apply-btn"
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
