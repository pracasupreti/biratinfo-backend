/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import { submitPost } from '@/actions/post.action';
import { handleCors } from '@/lib/cors';

export async function POST(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get('Authorization');
        if (!header) throw new Error("Unauthorized");
        await verifyClerkToken(header);

        const body = await req.json();
        if (!body) throw new Error("Body parameters are required");

        await connect();

        const newPost = await submitPost(body);
        if (!newPost.success) {
            const res = NextResponse.json(
                { success: false, message: newPost.message },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const res = NextResponse.json(
            { success: true, post: newPost },
            { status: 201 }
        );
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;

    } catch (err: any) {
        console.error('Create post error:', err.message);
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
