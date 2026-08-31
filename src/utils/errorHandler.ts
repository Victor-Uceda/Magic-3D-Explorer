/**
 * Manejador Centralizado de Errores de API (errorHandler.ts)
 *
 * Mapea errores de Scryfall y errores genéricos a mensajes
 * consistentes y amigables para el usuario, con indicador de
 * si la operación puede reintentarse.
 */

import {
  ScryfallError,
  ScryfallNotFoundError,
  ScryfallRateLimitError,
  ScryfallTimeoutError,
  ScryfallNetworkError,
} from '../services/scryfall/errors';

export interface HandledError {
  /** Mensaje descriptivo para mostrar al usuario */
  message: string;
  /** Si la operación puede reintentarse automáticamente o por el usuario */
  isRetryable: boolean;
}

/**
 * Transforma un error desconocido en un mensaje estandarizado
 *
 * @param error - Error capturado en un bloque catch
 * @param fallbackMessage - Mensaje genérico si el error no es reconocido
 * @returns Objeto con mensaje y bandera de retryability
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = 'Ocurrió un error inesperado. Intenta de nuevo.'
): HandledError {
  if (error instanceof ScryfallNotFoundError) {
    return {
      message: 'No se encontraron resultados para esta búsqueda.',
      isRetryable: false,
    };
  }

  if (error instanceof ScryfallRateLimitError) {
    return {
      message: 'Demasiadas solicitudes. Espera unos segundos e intenta de nuevo.',
      isRetryable: true,
    };
  }

  if (error instanceof ScryfallTimeoutError) {
    return {
      message: 'La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.',
      isRetryable: true,
    };
  }

  if (error instanceof ScryfallNetworkError) {
    return {
      message: 'Error de conexión. Verifica tu conexión a internet.',
      isRetryable: true,
    };
  }

  if (error instanceof ScryfallError) {
    return {
      message: error.message,
      isRetryable: (error.status ?? 0) >= 500,
    };
  }

  return {
    message: fallbackMessage,
    isRetryable: true,
  };
}
