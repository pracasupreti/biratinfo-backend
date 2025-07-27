import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Post from '@/model/post.model';
import { handleCors } from '@/lib/cors';
import { clerkClient } from '@clerk/nextjs/server';


export async function GET(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        await connect();
        const now = new Date();

        const scheduledPosts = await Post.find({ status: 'scheduled' });

        for (const post of scheduledPosts) {
            const scheduledDate = post.date; // '2025-07-02'
            const scheduledTime = post.time; // '14:00' or '14:00:00'
            const combined = new Date(`${scheduledDate}T${scheduledTime}`);

            if (combined <= now) {
                // Default status if no authors or Clerk check fails
                let newStatus = 'pending';

                // Check authors if they exist
                if (post.authors && post.authors.length > 0) {
                    try {
                        const userId = post.authors[0]; // Assuming first author is the main one
                        if (!userId) {
                            throw new Error('Unauthorized');
                        }
                        const client = await clerkClient();
                        const user = await client.users.getUser(userId);
                        const isEditor = user.publicMetadata?.role === 'editor';

                        if (isEditor) {
                            newStatus = 'approved';
                        }
                    } catch (error) {
                        console.error('Error checking user role:', error);
                        newStatus = 'pending'
                    }
                }

                await Post.findByIdAndUpdate(post._id, { status: newStatus });
            }
        }

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