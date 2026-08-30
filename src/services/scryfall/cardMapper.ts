import { ScryfallCard } from './types';
import { Card, LegalityStatus } from '../../types/card';

/**
 * Maps raw ScryfallCard payload to domain Card model
 * Handles regular cards and double-faced cards (DFC / Transform / Modal DFC)
 */
export function mapScryfallCardToDomain(scryfallCard: ScryfallCard): Card {
  const isDoubleFaced = Array.isArray(scryfallCard.card_faces) && scryfallCard.card_faces.length > 1;

  // Extract images: check top-level image_uris, or fallback to first face for DFC
  let imageUris = scryfallCard.image_uris;
  if (!imageUris && isDoubleFaced && scryfallCard.card_faces?.[0]?.image_uris) {
    imageUris = scryfallCard.card_faces[0].image_uris;
  }

  const safeImages = {
    small: imageUris?.small || '',
    normal: imageUris?.normal || '',
    large: imageUris?.large || '',
    png: imageUris?.png || '',
    artCrop: imageUris?.art_crop || '',
    borderCrop: imageUris?.border_crop || '',
  };

  // Mana cost & oracle text extraction
  let manaCost = scryfallCard.mana_cost || '';
  let oracleText = scryfallCard.oracle_text || '';
  let typeLine = scryfallCard.type_line || '';
  let artist = scryfallCard.artist || '';

  if (isDoubleFaced && scryfallCard.card_faces?.[0]) {
    const face0 = scryfallCard.card_faces[0];
    if (!manaCost) manaCost = face0.mana_cost || '';
    if (!oracleText) oracleText = face0.oracle_text || '';
    if (!typeLine) typeLine = face0.type_line || '';
    if (!artist) artist = face0.artist || '';
  }

  // Legalities conversion
  const legalities: Record<string, LegalityStatus> = {};
  if (scryfallCard.legalities) {
    Object.entries(scryfallCard.legalities).forEach(([format, status]) => {
      if (status === 'legal' || status === 'not_legal' || status === 'restricted' || status === 'banned') {
        legalities[format] = status as LegalityStatus;
      } else {
        legalities[format] = 'not_legal';
      }
    });
  }

  let backImageUri: string | undefined = undefined;
  let backName: string | undefined = undefined;
  let backTypeLine: string | undefined = undefined;
  let backOracleText: string | undefined = undefined;

  if (isDoubleFaced && scryfallCard.card_faces && scryfallCard.card_faces.length > 1) {
    const face1 = scryfallCard.card_faces[1];
    backImageUri = face1.image_uris?.normal || face1.image_uris?.large || face1.image_uris?.png;
    backName = face1.name;
    backTypeLine = face1.type_line;
    backOracleText = face1.oracle_text;
  }

  return {
    id: scryfallCard.id,
    name: scryfallCard.name,
    manaCost,
    cmc: scryfallCard.cmc || 0,
    typeLine,
    oracleText,
    colors: scryfallCard.colors || [],
    colorIdentity: scryfallCard.color_identity || [],
    rarity: scryfallCard.rarity || 'common',
    setName: scryfallCard.set_name || '',
    setCode: scryfallCard.set || '',
    collectorNumber: scryfallCard.collector_number || '',
    artist,
    imageUris: safeImages,
    prices: {
      usd: scryfallCard.prices?.usd || null,
      usdFoil: scryfallCard.prices?.usd_foil || null,
      eur: scryfallCard.prices?.eur || null,
      eurFoil: scryfallCard.prices?.eur_foil || null,
    },
    legalities: {
      standard: legalities.standard || 'not_legal',
      modern: legalities.modern || 'not_legal',
      legacy: legalities.legacy || 'not_legal',
      vintage: legalities.vintage || 'not_legal',
      commander: legalities.commander || 'not_legal',
      pioneer: legalities.pioneer || 'not_legal',
      pauper: legalities.pauper || 'not_legal',
      ...legalities,
    },
    releasedAt: scryfallCard.released_at,
    flavorText: scryfallCard.flavor_text || undefined,
    edhrecRank: scryfallCard.edhrec_rank || undefined,
    power: scryfallCard.power || undefined,
    toughness: scryfallCard.toughness || undefined,
    loyalty: scryfallCard.loyalty || undefined,
    scryfallUri: scryfallCard.scryfall_uri || undefined,
    isDoubleFaced,
    backImageUri,
    backName,
    backTypeLine,
    backOracleText,
  };
}
