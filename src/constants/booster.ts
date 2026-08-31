/**
 * Constantes del Simulador de Sobres (Booster Opener)
 *
 * Centraliza datos curados y tiempos de animación que antes
 * vivían como magic numbers dentro de BoosterOpener.tsx.
 */

/** Sets populares pre-cargados para selección rápida */
export const POPULAR_SETS: ReadonlyArray<{ code: string; name: string }> = [
  { code: 'mh3', name: 'Modern Horizons 3' },
  { code: 'fdn', name: 'Foundations' },
  { code: 'otj', name: 'Outlaws of Thunder Junction' },
  { code: 'mkm', name: 'Murders at Karlov Manor' },
  { code: 'lci', name: 'The Lost Caverns of Ixalan' },
  { code: 'woe', name: 'Wilds of Eldraine' },
  { code: 'mom', name: 'March of the Machine' },
  { code: 'neo', name: 'Kamigawa: Neon Dynasty' },
  { code: 'mh2', name: 'Modern Horizons 2' },
  { code: '2xm', name: 'Double Masters' },
] as const;

/** Tiempos de animación del flujo de apertura de sobre (en milisegundos) */
export const BOOSTER_ANIMATION = {
  /** Duración de la animación de apertura antes de revelar cartas */
  OPENING_DELAY_MS: 1100,
} as const;
