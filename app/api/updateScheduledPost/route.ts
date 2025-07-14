import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Post from '@/model/post.model';
import { handleCors } from '@/lib/cors';

export async function GET(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        await connect();
        const now = new Date();

        const scheduledPosts = await Post.find({ status: 'scheduled' });

        const toUpdate = scheduledPosts.filter(post => {
            const scheduledDate = post.date; // '2025-07-02'
            const scheduledTime = post.time; // '14:00' or '14:00:00'
            const combined = new Date(`${scheduledDate}T${scheduledTime}`);
            return combined <= now;
        });

        await Promise.all(
            toUpdate.map(post =>
                Post.findByIdAndUpdate(post._id, { status: 'pending' })
            )
        );

        const res = new NextResponse(null, { status: 200 });
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (error) {
        console.error('Error updating scheduled posts:', error);
        return new NextResponse(null, { status: 500 });
    }
}

export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
