export const USD_TO_PEN_RATE = 3.75;

/**
 * Formats a USD price into Peruvian Soles (PEN / S/.)
 * Example: "1.50" -> "S/ 5.63"
 */
export function formatPricePEN(usdPrice: string | number | null | undefined): string {
  if (usdPrice === null || usdPrice === undefined || usdPrice === '') {
    return 'S/ --';
  }
  const numericUsd = typeof usdPrice === 'number' ? usdPrice : parseFloat(usdPrice);
  if (isNaN(numericUsd)) {
    return 'S/ --';
  }
  const pen = numericUsd * USD_TO_PEN_RATE;
  return `S/ ${pen.toFixed(2)}`;
}
