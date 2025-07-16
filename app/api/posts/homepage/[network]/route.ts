/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { getLatestSummaryByNetwork } from '@/actions/post.action';
import { verifyApiKey } from '@/lib/auth';
import { handleCors } from '@/lib/cors';

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ network: string }> }) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        verifyApiKey(req);
        const { network } = await params
        if (!network) throw new Error("Network is required")
        await connect();

        const post = await getLatestSummaryByNetwork(network, [
            'tourism',
            'technology',
            'economy',
            'agriculture',
            'lifestyle',
            'sports',
            'health',
            'education',
            'entertainment',
            'culture',
        ]);

        if (!post) throw new Error("No approved posts found");

        const res = NextResponse.json({ success: true, post }, { status: 200 });

        // Set CORS headers on success response
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (err: any) {
        console.error('Summary route error:', err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}

// Handle preflight requests
export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
