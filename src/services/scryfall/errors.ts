/**
 * Explicit Scryfall Error Types
 */

export class ScryfallError extends Error {
  public status?: number;
  public details?: string;

  constructor(message: string, status?: number, details?: string) {
    super(message);
    this.name = 'ScryfallError';
    this.status = status;
    this.details = details;
  }
}

export class ScryfallNotFoundError extends ScryfallError {
  constructor(cardNameOrId: string) {
    super(`No se encontró ninguna carta con el nombre o ID: "${cardNameOrId}"`, 404);
    this.name = 'ScryfallNotFoundError';
  }
}

export class ScryfallRateLimitError extends ScryfallError {
  constructor(retryAfterMs?: number) {
    super(
      `Límite de solicitudes de Scryfall alcanzado (429 Too Many Requests). ${
        retryAfterMs ? `Reintentar en ${retryAfterMs}ms` : 'Espera un momento.'
      }`,
      429
    );
    this.name = 'ScryfallRateLimitError';
  }
}

export class ScryfallTimeoutError extends ScryfallError {
  constructor(timeoutMs: number) {
    super(`La solicitud a Scryfall excedió el tiempo límite (${timeoutMs}ms)`, 408);
    this.name = 'ScryfallTimeoutError';
  }
}

export class ScryfallNetworkError extends ScryfallError {
  constructor(originalError?: unknown) {
    super(
      'Error de conexión al comunicarse con Scryfall. Verifica tu conexión a internet.',
      0,
      originalError instanceof Error ? originalError.message : String(originalError)
    );
    this.name = 'ScryfallNetworkError';
  }
}
