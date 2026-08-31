/**
 * Constantes y medidas geométricas para el renderizado 3D de cartas MTG
 */

export const CARD_DIMENSIONS = {
  /** Ancho de la carta en unidades de Three.js */
  WIDTH: 2.5,
  /** Alto de la carta en unidades de Three.js */
  HEIGHT: 3.5,
  /** Radio de curvatura auténtico para las esquinas redondeadas de Magic */
  CORNER_RADIUS: 0.12,
  /** Profundidad / grosor de la extrusión 3D */
  DEPTH: 0.016,
  /** Segmentos de curva para las esquinas */
  CURVE_SEGMENTS: 32,
} as const;

export const ANIMATION_CONSTANTS = {
  /** Velocidad de interpolación (lerp) para la rotación con el cursor */
  ROTATION_LERP_SPEED: 0.22,
  /** Velocidad de interpolación para el escalado en hover */
  SCALE_LERP_SPEED: 0.12,
  /** Amplitud del movimiento de flotación vertical */
  FLOAT_AMPLITUDE: 0.08,
  /** Frecuencia de oscilación de la flotación */
  FLOAT_FREQUENCY: 1.6,
  /** Velocidad de rotación automática */
  AUTO_ROTATE_SPEED: 0.8,
} as const;

export const TEXTURE_URLS = {
  /** URL oficial del reverso clásico de cartas Magic: The Gathering en alta resolución */
  OFFICIAL_MTG_CARD_BACK: 'https://backs.scryfall.io/large/5/9/597b79b3-7d77-4261-871a-60dd17403388.jpg',
} as const;
