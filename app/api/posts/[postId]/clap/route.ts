import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import PostInteraction from '@/model/postInteraction.model';
import { auth } from '@clerk/nextjs/server';
import { handleCors } from '@/lib/cors';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const corsRes = handleCors(request);
    if (corsRes) return corsRes;

    const { postId } = await params;
    if (!postId) {
        const res = NextResponse.json(
            { error: 'Post Id is required' },
            { status: 400 }
        );
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    }

    const header = request.headers.get('Authorization');
    if (!header) {
        const res = NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    }

    try {
        await verifyClerkToken(header);
        const { userId } = await auth();

        if (!userId) {
            const res = NextResponse.json(
                { error: 'User ID required' },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        await connect();

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

        const res = NextResponse.json({
            claps: interaction?.claps?.length || 0,
            hasClapped: interaction?.claps?.includes(userId) || false
        });
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;

    } catch (error) {
        console.error(error);
        const res = NextResponse.json(
            { error: 'Failed to toggle clap' },
            { status: 500 }
        );
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const corsRes = handleCors(request);
    if (corsRes) return corsRes;

    const { postId } = await params;
    if (!postId) {
        const res = NextResponse.json(
            { error: 'Post Id is required' },
            { status: 400 }
        );
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    }

    try {
        await connect();
        const { userId } = await auth();

        const interaction = await PostInteraction.findOne({ postId });

        const res = NextResponse.json({
            claps: interaction?.claps?.length || 0,
            hasClapped: interaction?.claps?.includes(userId) || false
        });
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;

    } catch (error) {
        console.error(error);
        const res = NextResponse.json(
            { error: 'Failed to get clap' },
            { status: 500 }
        );
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    }
}

export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}