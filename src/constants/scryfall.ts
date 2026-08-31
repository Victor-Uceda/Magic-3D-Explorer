import type { Card } from '../types/card';

export const SCRYFALL_CONFIG = {
  /** Timeout para peticiones a Scryfall en milisegundos */
  REQUEST_TIMEOUT_MS: 10000,
  /** Delay mínimo entre peticiones para respetar el rate limit de Scryfall */
  MIN_REQUEST_DELAY_MS: 80,
  /** Delay para debounce de autocompletado en milisegundos */
  AUTOCOMPLETE_DEBOUNCE_MS: 200,
  /** Número máximo de sugerencias mostradas */
  MAX_SUGGESTIONS: 6,
} as const;

export const DEFAULT_CATALOG_QUERY = 'order:edhrec not:digital game:paper';

export const FEATURED_QUERY =
  '(name:"Black Lotus" or name:"Mox Sapphire" or name:"Dark Confidant" or name:"Snapcaster Mage" or name:"Liliana of the Veil" or name:"Jace, the Mind Sculptor" or name:"Tarmogoyf" or name:"Force of Will" or name:"Counterspell" or name:"Lightning Bolt" or name:"Path to Exile" or name:"Thoughtseize" or name:"Wrenn and Six" or name:"Ragavan, Nimble Pilferer" or name:"Orcish Bowmasters") not:digital game:paper';

/** Carta de fallback de alta fidelidad para inicio instantáneo */
export const DEFAULT_FALLBACK_CARD: Card = {
  id: 'fallback-black-lotus',
  name: 'Black Lotus',
  manaCost: '{0}',
  cmc: 0,
  typeLine: 'Artifact',
  oracleText: '{T}, Sacrifice Black Lotus: Add three mana of any one color.',
  colors: [],
  colorIdentity: [],
  rarity: 'rare',
  setName: 'Limited Edition Alpha',
  setCode: 'lea',
  collectorNumber: '232',
  artist: 'Christopher Rush',
  imageUris: {
    small: 'https://cards.scryfall.io/small/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    normal: 'https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    large: 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    png: 'https://cards.scryfall.io/png/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.png',
    artCrop: 'https://cards.scryfall.io/art_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    borderCrop: 'https://cards.scryfall.io/border_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
  },
  prices: {
    usd: '42000.00',
    usdFoil: null,
    eur: '38500.00',
    eurFoil: null,
  },
  legalities: {
    standard: 'not_legal',
    modern: 'not_legal',
    legacy: 'banned',
    vintage: 'restricted',
    commander: 'banned',
    pioneer: 'not_legal',
    pauper: 'not_legal',
  },
  releasedAt: '1993-08-05',
  flavorText: 'Still prized by collectors, feared by tables, and watched by every rules committee.',
};
