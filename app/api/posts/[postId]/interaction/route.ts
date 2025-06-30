import { verifyApiKey } from '@/lib/auth';
import { connect } from '@/lib/db';
import PostInteraction from '@/model/postInteraction.model';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


export async function GET(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {

    verifyApiKey(request);
    const { postId } = await params;
    if (!postId) throw new Error("Post Id is required")

    await connect();

    const { userId } = await auth();

    try {

        const interaction = await PostInteraction.findOne({ postId: postId });
        return NextResponse.json({
            claps: interaction?.claps?.length || 0,
            comments: interaction?.comments || [],
            hasClapped: interaction?.claps?.includes(userId) || false
        });
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Failed to fetch interaction data' },
            { status: 500 }
        );
    }
}