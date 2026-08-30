import {
  ScryfallCard,
  ScryfallList,
  ScryfallAutocomplete,
  ScryfallErrorResponse,
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
   * Internal request helper ensuring required headers, rate limiting and explicit error handling
   */
  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    // Respect Scryfall Rate Limit policy (minimum spacing between requests)
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.minRequestDelayMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minRequestDelayMs - timeSinceLast));
    }
    this.lastRequestTime = Date.now();

    // Construct URL
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });

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

      // Handle HTTP Error status codes
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
          `Scryfall API Error (${response.status}): ${errorDetails}`,
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
   * Search cards by query string (e.g. "type:artifact c:u")
   */
  public async searchCards(query: string, page = 1): Promise<ScryfallList<ScryfallCard>> {
    return this.request<ScryfallList<ScryfallCard>>('/cards/search', {
      q: query,
      page: page.toString(),
    });
  }

  /**
   * Fetch a single card by exact or fuzzy name
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
   * Fetch a single card by Scryfall UUID
   */
  public async getCardById(id: string): Promise<ScryfallCard> {
    return this.request<ScryfallCard>(`/cards/${id}`);
  }

  /**
   * Autocomplete card names for live search suggestions
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
   * Get a random card
   */
  public async getRandomCard(): Promise<ScryfallCard> {
    return this.request<ScryfallCard>('/cards/random');
  }
}

// Singleton export
export const scryfallClient = new ScryfallClient();
