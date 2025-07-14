/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import { updatePost } from '@/actions/post.action';
import { handleCors } from '@/lib/cors';

export async function PUT(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get('Authorization');
        if (!header) throw new Error("Unauthorized");
        await verifyClerkToken(header);

        const body = await req.json();
        if (!body) throw new Error("Body parameters are required");

        const { id, ...data } = body;
        if (!id) {
            const res = NextResponse.json(
                { success: false, message: 'Post ID is required' },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        await connect();
        const updatedPost = await updatePost(id, data);
        if (!updatedPost.success) {
            const res = NextResponse.json(
                { success: false, message: updatedPost.message },
                { status: updatedPost.code || 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const res = NextResponse.json(
            { success: true, post: updatedPost },
            { status: 200 }
        );
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;

    } catch (err: any) {
        console.error('Update post error:', err.message);
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
