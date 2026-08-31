import {
  ScryfallCard,
  ScryfallList,
  ScryfallAutocomplete,
  ScryfallErrorResponse,
  ScryfallSet,
} from './types';
import {
  ScryfallError,
  ScryfallNotFoundError,
  ScryfallRateLimitError,
  ScryfallTimeoutError,
  ScryfallNetworkError,
} from './errors';

export interface ScryfallClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
  minRequestDelayMs?: number;
}

/**
 * Cliente de conexión oficial con la API REST de Scryfall.
 * 
 * Gestiona:
 * 1. Respeto al Rate Limiting oficial (80-100ms entre peticiones).
 * 2. Timeout automático para evitar bloqueos de red.
 * 3. Mapeo estructurado de errores HTTP (404, 429, 500).
 */
export class ScryfallClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly minRequestDelayMs: number;
  private lastRequestTime = 0;

  constructor(config: ScryfallClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'https://api.scryfall.com';
    this.timeoutMs = config.timeoutMs || 8000;
    this.minRequestDelayMs = config.minRequestDelayMs || 80;
  }

  /**
   * Método auxiliar para realizar solicitudes HTTP con control de límites y cabeceras
   */
  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    // 1. Respetar intervalo mínimo entre peticiones (Políticas de Scryfall)
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.minRequestDelayMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minRequestDelayMs - timeSinceLast));
    }
    this.lastRequestTime = Date.now();

    // 2. Construir URL con parámetros de búsqueda
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });

    // 3. Configurar timeout con AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Magic3DExplorer/1.0',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 4. Manejo explícito de códigos de estado HTTP
      if (!response.ok) {
        if (response.status === 404) {
          const query = params.fuzzy || params.exact || params.q || endpoint;
          throw new ScryfallNotFoundError(query);
        }

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000;
          throw new ScryfallRateLimitError(retryMs);
        }

        let errorDetails = '';
        try {
          const errorJson: ScryfallErrorResponse = await response.json();
          errorDetails = errorJson.details || errorJson.code || response.statusText;
        } catch {
          errorDetails = response.statusText;
        }

        throw new ScryfallError(
          `Error de API Scryfall (${response.status}): ${errorDetails}`,
          response.status,
          errorDetails
        );
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof ScryfallError) {
        throw err;
      }

      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ScryfallTimeoutError(this.timeoutMs);
      }

      throw new ScryfallNetworkError(err);
    }
  }

  /**
   * Búsqueda general de cartas mediante sintaxis de Scryfall (ej: "t:creature c:blue")
   */
  public async searchCards(query: string, page = 1): Promise<ScryfallList<ScryfallCard>> {
    return this.request<ScryfallList<ScryfallCard>>('/cards/search', {
      q: query,
      page: page.toString(),
    });
  }

  /**
   * Obtiene la siguiente página de resultados usando la URL provista por Scryfall
   */
  public async fetchNextPage(nextPageUrl: string): Promise<ScryfallList<ScryfallCard>> {
    const url = new URL(nextPageUrl);
    const endpoint = url.pathname;
    const params: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      params[key] = val;
    });
    return this.request<ScryfallList<ScryfallCard>>(endpoint, params);
  }

  /**
   * Obtiene una carta por su nombre exacto o aproximado (fuzzy)
   */
  public async getCardNamed(name: string, exact = false): Promise<ScryfallCard> {
    const params: Record<string, string> = {};
    if (exact) {
      params.exact = name;
    } else {
      params.fuzzy = name;
    }
    return this.request<ScryfallCard>('/cards/named', params);
  }

  /**
   * Obtiene una carta específica por su identificador UUID
   */
  public async getCardById(id: string): Promise<ScryfallCard> {
    return this.request<ScryfallCard>(`/cards/${id}`);
  }

  /**
   * Autocompletado de nombres en tiempo real para la barra de búsqueda
   */
  public async autocomplete(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }
    const result = await this.request<ScryfallAutocomplete>('/cards/autocomplete', {
      q: query.trim(),
    });
    return result.data || [];
  }

  /**
   * Obtiene todas las versiones e ilustraciones históricas alternativas de una carta
   */
  public async getCardPrints(name: string, printsUri?: string): Promise<ScryfallCard[]> {
    if (printsUri) {
      try {
        const res = await this.fetchNextPage(printsUri);
        if (res.data && res.data.length > 0) {
          return res.data;
        }
      } catch {
        // En caso de fallo en la URL directa, continúa con la búsqueda por nombre
      }
    }
    const cleanName = name.split('//')[0].trim().replace(/"/g, '');
    const query = `!"${cleanName}" unique:prints`;
    const res = await this.searchCards(query);
    return res.data || [];
  }

  /**
   * Obtiene una carta aleatoria
   */
  public async getRandomCard(): Promise<ScryfallCard> {
    return this.request<ScryfallCard>('/cards/random');
  }

  /**
   * Lista todas las expansiones de Magic elegibles para sobres de apertura
   */
  public async getSets(): Promise<ScryfallSet[]> {
    const TIPOS_SOBRES_VALIDOS = new Set([
      'expansion', 'masters', 'draft_innovation', 'core',
    ]);
    const res = await this.request<ScryfallList<ScryfallSet>>('/sets');
    return (res.data || []).filter(
      (s) => TIPOS_SOBRES_VALIDOS.has(s.set_type) && s.card_count > 0
    );
  }

  /**
   * Obtiene el listado de cartas de una expansión filtradas por rareza
   */
  public async getSetCards(
    setCode: string,
    rarity: 'common' | 'uncommon' | 'rare' | 'mythic'
  ): Promise<ScryfallCard[]> {
    try {
      const query = `set:${setCode} r:${rarity} not:digital`;
      const res = await this.searchCards(query);
      return res.data || [];
    } catch {
      return [];
    }
  }
}

// Instancia singleton compartida en toda la aplicación
export const scryfallClient = new ScryfallClient();
