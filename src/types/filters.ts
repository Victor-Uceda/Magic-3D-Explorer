/**
 * Filter definitions for Magic 3D Explorer
 */

export interface FilterState {
  colors: string[]; // ['W', 'U', 'B', 'R', 'G', 'C']
  types: string[]; // ['creature', 'instant', 'sorcery', 'artifact', 'land', 'planeswalker', 'enchantment']
  format: string | null; // 'commander' | 'modern' | 'standard' | 'legacy' | 'pauper' | 'pioneer'
  rarity: string | null; // 'common' | 'uncommon' | 'rare' | 'mythic'
}

export const INITIAL_FILTERS: FilterState = {
  colors: [],
  types: [],
  format: null,
  rarity: null,
};
