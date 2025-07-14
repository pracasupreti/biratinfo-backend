/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { getLatestSummaryByCategory } from '@/actions/post.action';
import { verifyApiKey } from '@/lib/auth';
import { handleCors } from '@/lib/cors';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        verifyApiKey(req);
        const { category } = await params;
        if (!category) throw new Error("Category is required");

        await connect();

        const post = await getLatestSummaryByCategory(category);
        if (!post) throw new Error("No approved posts found");

        const res = NextResponse.json(
            { success: true, post },
            { status: 200 }
        );
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;

    } catch (err: any) {
        console.error('Summary route error:', err.message);
        const res = NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
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
