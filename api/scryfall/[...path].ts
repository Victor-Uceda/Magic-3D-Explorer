/**
 * api/scryfall/[...path].ts
 * Vercel Serverless Function: Proxy con Edge Caching (Capa L1 a costo $0)
 * 
 * Beneficios arquitectónicos:
 * 1. Absorbe peticiones repetidas con cabecera Cache-Control: s-maxage=86400 en el CDN de Vercel.
 * 2. Previene saturar a Scryfall (Rate-limit HTTP 429).
 * 3. 500 usuarios consultando la misma carta hoy generan solo 1 llamada externa a Scryfall.
 */

import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
  send: (body: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pathParam = req.query.path;
  const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam || '';

  // Construir querystring excluyendo el parámetro 'path' interno de Vercel
  const queryParams = new URLSearchParams();
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path' && value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else {
        queryParams.append(key, value);
      }
    }
  });

  const queryString = queryParams.toString();
  const targetUrl = `https://api.scryfall.com/${path}${queryString ? `?${queryString}` : ''}`;

  try {
    const scryfallResponse = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Magic3DExplorer/1.0',
        'Accept': 'application/json',
      },
    });

    if (!scryfallResponse.ok) {
      return res.status(scryfallResponse.status).json({
        error: `Scryfall API returned status ${scryfallResponse.status}`,
      });
    }

    const data = await scryfallResponse.json();

    // ⚡ CLAVE ARQUITECTÓNICA SENIOR: Edge Caching en red global de Vercel
    // s-maxage=86400 (24h en CDN), stale-while-revalidate=43200 (12h de gracia)
    res.setHeader(
      'Cache-Control',
      's-maxage=86400, stale-while-revalidate=43200, public'
    );
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    return res.status(500).json({ error: message });
  }
}
