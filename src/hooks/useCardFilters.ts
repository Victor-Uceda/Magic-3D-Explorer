import { useState, useMemo, useCallback } from 'react';
import { FilterState, INITIAL_FILTERS } from '../types/filters';
import type { SortOption } from '../pages/CatalogGrid';

export interface UseCardFiltersReturn {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  sortBy: SortOption;
  setSortBy: React.Dispatch<React.SetStateAction<SortOption>>;
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeFilterCount: number;
  resetFilters: () => void;
}

export function useCardFilters(): UseCardFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Cómputo memoizado de filtros activos (evita estados desincronizados)
  const activeFilterCount = useMemo(() => {
    return (
      filters.colors.length +
      filters.types.length +
      (filters.format ? 1 : 0) +
      (filters.rarity ? 1 : 0)
    );
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    isFilterModalOpen,
    setIsFilterModalOpen,
    activeFilterCount,
    resetFilters,
  };
}
