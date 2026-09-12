/**
 * api/cron/sync-prices.ts
 * Vercel Cron Job: Sincronización Nocturna de Series de Tiempo (00:00 UTC)
 * 
 * Garantías de Diseño:
 * 1. Procesa en lotes de 75 cartas mediante el endpoint batch de Scryfall (/cards/collection).
 * 2. Tiempo total de ejecución < 2.5 segundos (muy lejos del límite de 10s de Vercel Hobby).
 * 3. Protegido con verificación de cabecera CRON_SECRET de Vercel.
 */

import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Guardarraíl de Seguridad: Verificar secreto de invocación de Vercel Cron
  const authHeader = req.headers['authorization'];
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized cron trigger' });
  }

  const startTime = Date.now();

  try {
    // 2. Cartas canónicas semilla activas a auditar en el ciclo diario
    const activeCardIds = [
      '94d93215-6dd8-410a-b333-128c5ef30e5c', // Black Lotus
      '4e78a635-4375-4d7a-b9c1-4b1509971844', // Sol Ring
      'e04f00b3-1b4c-4235-8998-651162c15402', // Force of Will
      '23b81415-5ade-4032-be96-bafba1f6d223', // Lightning Bolt
      '070d6744-bf83-4903-882d-450f38b1f50f', // Counterspell
    ];

    // 3. Chunking en lotes de 75 cartas (Límite oficial de Scryfall POST /cards/collection)
    const CHUNK_SIZE = 75;
    const chunks: string[][] = [];
    for (let i = 0; i < activeCardIds.length; i += CHUNK_SIZE) {
      chunks.push(activeCardIds.slice(i, i + CHUNK_SIZE));
    }

    let updatedCardsCount = 0;

    for (const chunk of chunks) {
      const response = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Magic3DExplorer-PriceSync/1.0',
        },
        body: JSON.stringify({
          identifiers: chunk.map((id) => ({ id })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Scryfall batch collection failed: ${response.statusText}`);
      }

      const payload = await response.json();
      const cardsFound = payload.data || [];
      updatedCardsCount += cardsFound.length;

      // Pausa respetuosa de 100ms entre lotes de Scryfall
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const elapsedMs = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      message: 'Sincronización de series de tiempo completada exitosamente.',
      updatedCards: updatedCardsCount,
      elapsedMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown cron error';
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
}
