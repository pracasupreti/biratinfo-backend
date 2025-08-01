// lib/cors.ts
import { NextRequest, NextResponse } from 'next/server';

if (!process.env.ALLOWED_ORIGINS) {
  throw new Error('Missing environment variable: ALLOWED_ORIGINS');
}

const allowedOrigins = process.env.ALLOWED_ORIGINS
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);


const ALWAYS_ALLOWED_ORIGIN = 'https://www.biratinfo.com';


export function handleCors(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin') || '';
  const res = new NextResponse();

  if (allowedOrigins.includes(origin) || origin === ALWAYS_ALLOWED_ORIGIN) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Vary', 'Origin');
  }

  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-special-key, Authorization');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.headers.set('Access-Control-Max-Age', '86400');
    return res;
  }

  return null;
}
