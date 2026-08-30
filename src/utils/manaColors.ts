/**
 * Utility to calculate thematic mana aura color based on card color identity
 */
export function getManaAuraColor(colors?: string[] | null): string {
  if (!colors || colors.length === 0) {
    // Incoloro / Artefacto -> Bronce antiguo cálido
    return '#8c733e';
  }

  if (colors.length > 1) {
    // Multicolor -> Oro legendario
    return '#d4af37';
  }

  const singleColor = colors[0].toUpperCase();
  switch (singleColor) {
    case 'W':
      // Blanco -> Ámbar perla
      return '#fef3c7';
    case 'U':
      // Azul -> Zafiro profundo
      return '#3b82f6';
    case 'B':
      // Negro -> Pizarra sombría
      return '#64748b';
    case 'R':
      // Rojo -> Fuego carmesí
      return '#ef4444';
    case 'G':
      // Verde -> Esmeralda bosque
      return '#22c55e';
    default:
      return '#8c733e';
  }
}
