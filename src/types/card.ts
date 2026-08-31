/**
 * Domain types for Magic 3D Explorer
 */

export interface CardPrices {
  usd: string | null;
  usdFoil: string | null;
  eur: string | null;
  eurFoil: string | null;
}

export type LegalityStatus = 'legal' | 'not_legal' | 'restricted' | 'banned';

export interface CardLegalities {
  standard: LegalityStatus;
  modern: LegalityStatus;
  legacy: LegalityStatus;
  vintage: LegalityStatus;
  commander: LegalityStatus;
  pioneer: LegalityStatus;
  pauper: LegalityStatus;
  [format: string]: LegalityStatus;
}

export interface CardImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  artCrop: string;
  borderCrop: string;
}

export interface Card {
  id: string;
  name: string;
  manaCost: string;
  cmc: number;
  typeLine: string;
  oracleText: string;
  colors?: string[];
  colorIdentity?: string[];
  rarity: string;
  setName: string;
  setCode: string;
  collectorNumber: string;
  artist: string;
  imageUris: CardImageUris;
  prices: CardPrices;
  legalities: CardLegalities;
  releasedAt?: string;
  flavorText?: string;
  edhrecRank?: number;
  power?: string;
  toughness?: string;
  loyalty?: string;
  scryfallUri?: string;
  isDoubleFaced?: boolean;
  backImageUri?: string;
  backName?: string;
  backTypeLine?: string;
  backOracleText?: string;
  printsSearchUri?: string;
  oracleId?: string;
}
