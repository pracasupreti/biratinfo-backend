// /app/api/updateScheduledPosts/route.ts
import { NextResponse } from 'next/server';

import { connect } from '@/lib/db';
import Post from '@/model/post.model';

export async function GET() {
    try {
        await connect();
        console.log("ROUTE HIT")

        // today's date 
        const today = new Date();

        // scheduled posts whose scheduledDate is <= today
        const scheduledPosts = await Post.find({
            status: 'scheduled',
            date: { $lte: today },
            time: { $lte: today }
        });

        // Update status to "pending"
        const updatePromises = scheduledPosts.map(post =>
            Post.findByIdAndUpdate(post._id, { status: 'pending' })
        );

        await Promise.all(updatePromises);

        // Return empty response
        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error('Error updating scheduled posts:', error);
        return new NextResponse(null, { status: 500 });
    }
}
