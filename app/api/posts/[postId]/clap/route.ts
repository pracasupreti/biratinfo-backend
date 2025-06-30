import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import PostInteraction from '@/model/postInteraction.model';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


export async function POST(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;
    if (!postId) throw new Error("Post Id is required");

    const header = request.headers.get('Authorization');
    if (!header) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await verifyClerkToken(header);

    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    await connect();

    try {
        // First try to find the existing interaction
        let interaction = await PostInteraction.findOne({ postId });

        if (!interaction) {
            // Create new interaction with user's clap
            interaction = await PostInteraction.create({
                postId,
                claps: [userId]
            });
        } else {
            // Check if user already clapped
            const hasClapped = interaction.claps.includes(userId);

            if (hasClapped) {
                // Remove clap
                await PostInteraction.updateOne(
                    { postId },
                    { $pull: { claps: userId } }
                );
            } else {
                // Add clap
                await PostInteraction.updateOne(
                    { postId },
                    { $addToSet: { claps: userId } }
                );
            }

            // Get updated interaction
            interaction = await PostInteraction.findOne({ postId });
        }

        return NextResponse.json({
            claps: interaction?.claps?.length || 0,
            hasClapped: interaction?.claps?.includes(userId) || false
        });

    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Failed to toggle clap' },
            { status: 500 }
        );
    }
}


export async function GET(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;
    if (!postId) throw new Error("Post Id is required")


    await connect();
    const { userId } = await auth();

    try {
        const interaction = await PostInteraction.findOne({ postId });

        return NextResponse.json({
            claps: interaction?.claps?.length || 0,
            hasClapped: interaction?.claps?.includes(userId) || false
        });


    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Failed to get clap' },
            { status: 500 }
        );
    }
}