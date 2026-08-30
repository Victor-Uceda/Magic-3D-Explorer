/**
 * Raw Scryfall API Types
 * Documentation: https://scryfall.com/docs/api
 */

export interface ScryfallImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
}

export interface ScryfallCardFace {
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  colors?: string[];
  artist?: string;
  image_uris?: ScryfallImageUris;
}

export interface ScryfallPrices {
  usd: string | null;
  usd_foil: string | null;
  usd_etched: string | null;
  eur: string | null;
  eur_foil: string | null;
  tix: string | null;
}

export interface ScryfallLegalities {
  standard: string;
  future?: string;
  historic?: string;
  gladiator?: string;
  pioneer: string;
  explorer?: string;
  modern: string;
  legacy: string;
  pauper: string;
  vintage: string;
  penny?: string;
  commander: string;
  oathbreaker?: string;
  brawl?: string;
  alchemy?: string;
  paupercommander?: string;
  duel?: string;
  oldschool?: string;
  premodern?: string;
  predh?: string;
  [key: string]: string | undefined;
}

export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity: string[];
  rarity: string;
  set: string;
  set_name: string;
  collector_number: string;
  artist?: string;
  image_uris?: ScryfallImageUris;
  card_faces?: ScryfallCardFace[];
  prices: ScryfallPrices;
  legalities: ScryfallLegalities;
  flavor_text?: string;
  edhrec_rank?: number;
  power?: string;
  toughness?: string;
  loyalty?: string;
  scryfall_uri?: string;
  released_at?: string;
  layout?: string;
}

export interface ScryfallList<T> {
  object: 'list';
  total_cards?: number;
  has_more: boolean;
  next_page?: string;
  data: T[];
}

export interface ScryfallAutocomplete {
  object: 'catalog';
  total_values: number;
  data: string[];
}

export interface ScryfallErrorResponse {
  object: 'error';
  code: string;
  status: number;
  details: string;
  type?: string;
}

export interface ScryfallSet {
  object: 'set';
  id: string;
  code: string;
  name: string;
  set_type: string;
  released_at?: string;
  card_count: number;
  icon_svg_uri: string;
  scryfall_uri?: string;
}
