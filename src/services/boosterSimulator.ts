/**
 * Simulador de Sobres de Draft (Booster Pack Simulator)
 * 
 * Distribución estándar oficial MTG:
 * - 10 Comunes
 * - 3 Infrecuentes
 * - 1 Rara o Mítica (probabilidad de mítica ~1 en 7.4)
 * - 1 Carta Bonus / Foil
 */

import { scryfallClient, mapScryfallCardToDomain } from './scryfall';
import { USD_TO_PEN_RATE } from '../utils/pricing';
import type { Card } from '../types/card';

export const BOOSTER_CONFIG = {
  COMMONS_COUNT: 10,
  UNCOMMONS_COUNT: 3,
  MYTHIC_RATE: 1 / 7.4,
  TOTAL_CARDS: 15,
} as const;

export interface BoosterCard {
  card: Card;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  isRareSlot: boolean;
}

export interface BoosterPack {
  setCode: string;
  setName: string;
  cards: BoosterCard[];
  totalValueUsd: number;
  totalValuePen: number;
}

// Caché en memoria para evitar peticiones repetitivas del mismo set
const cardPoolCache = new Map<string, {
  commons: Card[];
  uncommons: Card[];
  rares: Card[];
  mythics: Card[];
  all: Card[];
}>();

/**
 * Selecciona N elementos aleatorios sin repetición de un arreglo
 */
function pickRandom<T>(arr: T[], count: number): T[] {
  if (!arr || arr.length === 0) return [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Valida y normaliza la rareza de una carta
 */
function normalizeBoosterRarity(
  rarity: string | undefined,
  fallback: 'common' | 'uncommon' | 'rare' | 'mythic'
): 'common' | 'uncommon' | 'rare' | 'mythic' {
  if (rarity === 'common' || rarity === 'uncommon' || rarity === 'rare' || rarity === 'mythic') {
    return rarity;
  }
  return fallback;
}

/**
 * Obtiene y cachea los pools de cartas de una colección divididos por rareza
 */
async function getCardPools(setCode: string) {
  const cached = cardPoolCache.get(setCode);
  if (cached) return cached;

  // Consultar en paralelo los 4 grupos de rareza
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

  // Si algún pool viene vacío, obtener la colección completa como respaldo
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
      // Ignorar error de respaldo
    }
  }

  const pools = { commons, uncommons, rares, mythics, all };
  cardPoolCache.set(setCode, pools);
  return pools;
}

/**
 * Genera un sobre simulado completo de 15 cartas para una colección dada
 */
export async function generateBoosterPack(
  setCode: string,
  setName: string,
): Promise<BoosterPack> {
  const pools = await getCardPools(setCode);
  const fallbackPool = pools.all.length > 0 ? pools.all : pools.commons;

  const boosterCards: BoosterCard[] = [];

  // 1. 10 Cartas Comunes
  const commonPool = pools.commons.length > 0 ? pools.commons : fallbackPool;
  const commons = pickRandom(commonPool, BOOSTER_CONFIG.COMMONS_COUNT);
  for (const c of commons) {
    boosterCards.push({ card: c, rarity: 'common', isRareSlot: false });
  }

  // 2. 3 Cartas Infrecuentes
  const uncommonPool = pools.uncommons.length > 0 ? pools.uncommons : fallbackPool;
  const uncommons = pickRandom(uncommonPool, BOOSTER_CONFIG.UNCOMMONS_COUNT);
  for (const u of uncommons) {
    boosterCards.push({ card: u, rarity: 'uncommon', isRareSlot: false });
  }

  // 3. 1 Carta Rara o Mítica (probabilidad de mítica ~1 en 7.4)
  const isMythic = Math.random() < BOOSTER_CONFIG.MYTHIC_RATE;
  const rarePool = isMythic && pools.mythics.length > 0
    ? pools.mythics
    : (pools.rares.length > 0 ? pools.rares : fallbackPool);

  const rareCard = pickRandom(rarePool, 1)[0];
  if (rareCard) {
    boosterCards.push({
      card: rareCard,
      rarity: normalizeBoosterRarity(rareCard.rarity, isMythic ? 'mythic' : 'rare'),
      isRareSlot: true,
    });
  }

  // 4. 1 Carta Bonus / Foil adicional
  const bonusPool = pools.all.length > 0 ? pools.all : fallbackPool;
  const bonus = pickRandom(bonusPool, 1)[0];
  if (bonus) {
    boosterCards.push({
      card: bonus,
      rarity: normalizeBoosterRarity(bonus.rarity, 'common'),
      isRareSlot: false,
    });
  }

  // Completar hasta el total de cartas si hiciera falta
  while (boosterCards.length < BOOSTER_CONFIG.TOTAL_CARDS && fallbackPool.length > 0) {
    const extra = pickRandom(fallbackPool, 1)[0];
    if (!extra) break;
    boosterCards.push({
      card: extra,
      rarity: normalizeBoosterRarity(extra.rarity, 'common'),
      isRareSlot: false,
    });
  }

  // Calcular valor económico total del sobre
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
    totalValuePen: Math.round(totalUsd * USD_TO_PEN_RATE * 100) / 100,
  };
}

/**
 * Limpia la memoria caché de colecciones
 */
export function clearBoosterCache() {
  cardPoolCache.clear();
}
