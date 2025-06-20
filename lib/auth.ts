import { verifyToken } from '@clerk/backend';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) throw new Error('CLERK_SECRET_KEY is not configured');

export async function verifyClerkToken(authHeader?: string) {
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Invalid authorization format');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        throw new Error('Token not provided');
    }

    const payload = await verifyToken(token, { secretKey: CLERK_SECRET_KEY }).catch(() => null);
    if (!payload) {
        throw new Error('Invalid or expired token');
    }

    return payload;
}

export function verifyApiKey(request: Request) {
    const apiKeyHeader = request.headers.get('x-special-key');
    const expectedKey = process.env.API_KEY;

    if (!apiKeyHeader || apiKeyHeader !== expectedKey) {
        throw new Error('Unauthorized: Invalid or missing API key');
    }
}