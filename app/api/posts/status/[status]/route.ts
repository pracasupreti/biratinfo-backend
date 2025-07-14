/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import { getPostsByStatus } from '@/actions/post.action';
import { handleCors } from '@/lib/cors';

const ALLOWED_STATUSES = new Set(['draft', 'pending', 'approved', 'scheduled', 'rejected']);

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ status: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get('Authorization');
        if (!header) throw new Error("Unauthorized");
        await verifyClerkToken(header);

        const { status } = await params;
        if (!ALLOWED_STATUSES.has(status)) {
            const res = NextResponse.json({
                success: false,
                message: 'Invalid status parameter',
                allowedStatuses: Array.from(ALLOWED_STATUSES),
            }, { status: 400 });
            res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        await connect();
        const posts = await getPostsByStatus(status);

        if (!posts.success) {
            const res = NextResponse.json(
                { success: false, message: posts.message },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const res = NextResponse.json(
            { success: true, posts },
            { status: 200 }
        );
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;

    } catch (err: any) {
        console.error('Status route error:', err.message);
        const res = NextResponse.json(
            { success: false, message: err.message },
            { status: err.message.includes('token') ? 401 : 500 }
        );
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    }
}

export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}