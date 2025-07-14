/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import { deletePostById, getPostById } from '@/actions/post.action';
import { handleCors } from '@/lib/cors';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get('Authorization');
        if (!header) throw new Error("Unauthorized");
        await verifyClerkToken(header);

        const { id } = await params;
        if (!id) throw new Error("Id is required");

        await connect();
        const posts = await getPostById(id);

        const res = NextResponse.json({ success: true, posts }, { status: 200 });
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

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get('Authorization');
        if (!header) throw new Error("Unauthorized");
        await verifyClerkToken(header);

        const { id } = await params;
        if (!id) throw new Error("Id is required");

        await connect();
        const posts = await deletePostById(id);

        const res = NextResponse.json({ success: true, posts }, { status: 200 });
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
