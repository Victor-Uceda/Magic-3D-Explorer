/**
 * FilterSection — Sección genérica reutilizable de filtros
 *
 * Renderiza un grupo de opciones con título, soportando
 * selección múltiple (colores, tipos) y selección única (formato, rareza).
 * Extrae el patrón repetido 4 veces en AdvancedFilters.tsx.
 */

import React from 'react';
import { Check } from 'lucide-react';

export interface FilterOption {
  code: string;
  label: string;
  color?: string;
}

interface FilterSectionProps {
  /** Título visible del grupo de filtros */
  title: string;
  /** Lista de opciones disponibles */
  options: ReadonlyArray<FilterOption>;
  /** Valores actualmente seleccionados */
  selected: string | string[] | null;
  /** Callback al cambiar selección */
  onToggle: (code: string) => void;
  /** Color del check/borde activo (por defecto gold) */
  activeColor?: string;
  /** Componente extra a renderizar antes del label (ej: ManaSymbol) */
  renderPrefix?: (option: FilterOption) => React.ReactNode;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  options,
  selected,
  onToggle,
  activeColor = 'var(--gold-primary)',
  renderPrefix,
}) => {
  const isSelected = (code: string): boolean => {
    if (Array.isArray(selected)) return selected.includes(code);
    return selected === code;
  };

  return (
    <div>
      <span className="filter-section-title">{title}</span>
      <div className="filter-section-options">
        {options.map((opt) => {
          const active = isSelected(opt.code);
          const checkColor = opt.color || activeColor;

          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => onToggle(opt.code)}
              className={`filter-option-btn ${active ? 'filter-option-btn--active' : ''}`}
              style={{
                borderColor: active ? checkColor : undefined,
                background: active ? `${checkColor}20` : undefined,
              }}
            >
              {renderPrefix?.(opt)}
              <span>{opt.label}</span>
              {active && <Check size={12} color={checkColor} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterSection;
