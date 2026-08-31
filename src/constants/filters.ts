/**
 * Opciones de Filtros Avanzados (filters.ts)
 *
 * Datos de referencia para los selectores de Color, Tipo, Formato y Rareza
 * utilizados en AdvancedFilters y potencialmente en CatalogGrid.
 */

export const COLOR_OPTIONS: ReadonlyArray<{ code: string; label: string }> = [
  { code: 'W', label: 'Blanco' },
  { code: 'U', label: 'Azul' },
  { code: 'B', label: 'Negro' },
  { code: 'R', label: 'Rojo' },
  { code: 'G', label: 'Verde' },
  { code: 'C', label: 'Incoloro' },
];

export const TYPE_OPTIONS: ReadonlyArray<{ code: string; label: string }> = [
  { code: 'creature', label: 'Criatura' },
  { code: 'instant', label: 'Instantáneo' },
  { code: 'sorcery', label: 'Conjuro' },
  { code: 'artifact', label: 'Artefacto' },
  { code: 'enchantment', label: 'Encantamiento' },
  { code: 'planeswalker', label: 'Planeswalker' },
  { code: 'land', label: 'Tierra' },
];

export const FORMAT_OPTIONS: ReadonlyArray<{ code: string; label: string }> = [
  { code: 'commander', label: 'Commander / EDH' },
  { code: 'modern', label: 'Modern' },
  { code: 'standard', label: 'Standard' },
  { code: 'pioneer', label: 'Pioneer' },
  { code: 'legacy', label: 'Legacy' },
  { code: 'pauper', label: 'Pauper' },
];

export const RARITY_OPTIONS: ReadonlyArray<{ code: string; label: string; color: string }> = [
  { code: 'common', label: 'Común', color: '#94a3b8' },
  { code: 'uncommon', label: 'Poco común', color: '#cbd5e1' },
  { code: 'rare', label: 'Rara', color: '#d4af37' },
  { code: 'mythic', label: 'Mítica', color: '#f97316' },
];
