// /app/api/updateScheduledPosts/route.ts
import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import Post from '@/model/post.model';

export async function GET() {
    try {
        await connect();

        const now = new Date();

        // Get all scheduled posts
        const scheduledPosts = await Post.find({ status: 'scheduled' });

        const toUpdate = scheduledPosts.filter(post => {
            const scheduledDate = post.date; // e.g., 2025-07-02
            const scheduledTime = post.time; // e.g., '14:00' or '14:00:00'

            // Combine date and time into a Date object
            const combined = new Date(`${scheduledDate}T${scheduledTime}`);

            return combined <= now;
        });

        const updatePromises = toUpdate.map(post =>
            Post.findByIdAndUpdate(post._id, { status: 'pending' })
        );

        await Promise.all(updatePromises);

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error('Error updating scheduled posts:', error);
        return new NextResponse(null, { status: 500 });
    }
}
