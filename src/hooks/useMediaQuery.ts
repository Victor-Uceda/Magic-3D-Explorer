/**
 * Custom Hook: useMediaQuery & useResponsive (useMediaQuery.ts)
 * 
 * Proporciona detección programática de breakpoints para adaptar interfaces 3D,
 * drawers y layouts dinámicos de forma reactiva y sin fugas de memoria.
 */

import { useState, useEffect } from 'react';

/**
 * Escucha un media query CSS estándar y retorna si coincide actualmente
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Compatibilidad moderna con addEventListener
    mediaQueryList.addEventListener('change', listener);
    setMatches(mediaQueryList.matches);

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

export interface ResponsiveBreakpoints {
  /** Pantallas menores a 480px (Smartphones compactos) */
  isMobile: boolean;
  /** Pantallas entre 481px y 768px (Smartphones grandes y tablets verticales) */
  isTablet: boolean;
  /** Pantallas entre 769px y 1024px (Laptops compactas o tablets horizontales) */
  isSmallDesktop: boolean;
  /** Pantallas mayores a 1024px (Monitores de escritorio y pantallas de estudio) */
  isDesktop: boolean;
  /** Si la pantalla está en orientación vertical */
  isPortrait: boolean;
}

/**
 * Hook de alto nivel con los breakpoints oficiales de Magic 3D Explorer
 */
export function useResponsive(): ResponsiveBreakpoints {
  const isMobile = useMediaQuery('(max-width: 480px)');
  const isTablet = useMediaQuery('(min-width: 481px) and (max-width: 768px)');
  const isSmallDesktop = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const isPortrait = useMediaQuery('(orientation: portrait)');

  return {
    isMobile,
    isTablet,
    isSmallDesktop,
    isDesktop,
    isPortrait,
  };
}
