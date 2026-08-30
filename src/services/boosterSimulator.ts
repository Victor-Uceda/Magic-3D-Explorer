/**
 * Booster Pack Simulator
 * Generates a simulated Draft Booster from a given MTG set using Scryfall data.
 * Standard distribution: 10 Commons, 3 Uncommons, 1 Rare/Mythic, 1 Bonus/Foil slot
 */

import { scryfallClient, mapScryfallCardToDomain } from './scryfall';
import type { Card } from '../types/card';

export interface BoosterPack {
  setCode: string;
  setName: string;
  cards: BoosterCard[];
  totalValueUsd: number;
  totalValuePen: number;
}

export interface BoosterCard {
  card: Card;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  isRareSlot: boolean;
}

// In-memory cache to avoid redundant API calls for the same set
const cardPoolCache = new Map<string, {
  commons: Card[];
  uncommons: Card[];
  rares: Card[];
  mythics: Card[];
  all: Card[];
}>();

function pickRandom<T>(arr: T[], count: number): T[] {
  if (!arr || arr.length === 0) return [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Fetch and cache the card pools for a set (all rarities)
 */
async function getCardPools(setCode: string) {
  const cached = cardPoolCache.get(setCode);
  if (cached) return cached;

  // Fetch all four rarity pools in parallel
  const [rawCommons, rawUncommons, rawRares, rawMythics] = await Promise.all([
    scryfallClient.getSetCards(setCode, 'common'),
    scryfallClient.getSetCards(setCode, 'uncommon'),
    scryfallClient.getSetCards(setCode, 'rare'),
    scryfallClient.getSetCards(setCode, 'mythic'),
  ]);

  let commons = rawCommons.map(mapScryfallCardToDomain);
  let uncommons = rawUncommons.map(mapScryfallCardToDomain);
  let rares = rawRares.map(mapScryfallCardToDomain);
  let mythics = rawMythics.map(mapScryfallCardToDomain);

  // If any pool is empty, fetch all cards from set as fallback
  let all: Card[] = [...commons, ...uncommons, ...rares, ...mythics];
  if (all.length === 0) {
    try {
      const res = await scryfallClient.searchCards(`set:${setCode} not:digital`);
      all = (res.data || []).map(mapScryfallCardToDomain);
      commons = all.filter((c) => c.rarity === 'common');
      uncommons = all.filter((c) => c.rarity === 'uncommon');
      rares = all.filter((c) => c.rarity === 'rare');
      mythics = all.filter((c) => c.rarity === 'mythic');
    } catch {
      // Ignore
    }
  }

  const pools = { commons, uncommons, rares, mythics, all };
  cardPoolCache.set(setCode, pools);
  return pools;
}

/**
 * Generate a simulated Draft Booster pack for a given set
 */
export async function generateBoosterPack(
  setCode: string,
  setName: string,
): Promise<BoosterPack> {
  const pools = await getCardPools(setCode);
  const fallbackPool = pools.all.length > 0 ? pools.all : pools.commons;

  const boosterCards: BoosterCard[] = [];

  // 1. 10 Commons (or fill from fallback pool)
  const commonPool = pools.commons.length > 0 ? pools.commons : fallbackPool;
  const commons = pickRandom(commonPool, 10);
  for (const c of commons) {
    boosterCards.push({ card: c, rarity: 'common', isRareSlot: false });
  }

  // 2. 3 Uncommons (or fill from fallback pool)
  const uncommonPool = pools.uncommons.length > 0 ? pools.uncommons : fallbackPool;
  const uncommons = pickRandom(uncommonPool, 3);
  for (const u of uncommons) {
    boosterCards.push({ card: u, rarity: 'uncommon', isRareSlot: false });
  }

  // 3. 1 Rare or Mythic (approximately 1 in 7.4 chance of mythic)
  const isMythic = Math.random() < (1 / 7.4);
  const rarePool = isMythic && pools.mythics.length > 0
    ? pools.mythics
    : (pools.rares.length > 0 ? pools.rares : fallbackPool);
  
function normalizeBoosterRarity(
  rarity: string | undefined,
  fallback: 'common' | 'uncommon' | 'rare' | 'mythic'
): 'common' | 'uncommon' | 'rare' | 'mythic' {
  if (rarity === 'common' || rarity === 'uncommon' || rarity === 'rare' || rarity === 'mythic') {
    return rarity;
  }
  return fallback;
}

  const rareCard = pickRandom(rarePool, 1)[0];
  if (rareCard) {
    boosterCards.push({
      card: rareCard,
      rarity: normalizeBoosterRarity(rareCard.rarity, isMythic ? 'mythic' : 'rare'),
      isRareSlot: true,
    });
  }

  // 4. 1 Extra / Foil bonus slot
  const bonusPool = pools.all.length > 0 ? pools.all : fallbackPool;
  const bonus = pickRandom(bonusPool, 1)[0];
  if (bonus) {
    boosterCards.push({
      card: bonus,
      rarity: normalizeBoosterRarity(bonus.rarity, 'common'),
      isRareSlot: false,
    });
  }

  // If still less than 15, top up from fallback
  while (boosterCards.length < 15 && fallbackPool.length > 0) {
    const extra = pickRandom(fallbackPool, 1)[0];
    if (!extra) break;
    boosterCards.push({
      card: extra,
      rarity: normalizeBoosterRarity(extra.rarity, 'common'),
      isRareSlot: false,
    });
  }

  // Calculate total value
  let totalUsd = 0;
  for (const bc of boosterCards) {
    const usd = bc.card?.prices?.usd ? parseFloat(bc.card.prices.usd) : 0;
    totalUsd += isNaN(usd) ? 0 : usd;
  }

  return {
    setCode,
    setName,
    cards: boosterCards,
    totalValueUsd: Math.round(totalUsd * 100) / 100,
    totalValuePen: Math.round(totalUsd * 3.75 * 100) / 100,
  };
}

/**
 * Clear cached card pools (e.g., on set change)
 */
export function clearBoosterCache() {
  cardPoolCache.clear();
}
