import { verifyApiKey } from '@/lib/auth';
import { connect } from '@/lib/db';
import PostInteraction from '@/model/postInteraction.model';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { handleCors } from '@/lib/cors';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const corsRes = handleCors(request);
    if (corsRes) return corsRes;

    verifyApiKey(request);
    const { postId } = await params;
    if (!postId) throw new Error("Post Id is required");

    await connect();

    const { userId } = await auth();

    try {
        const interaction = await PostInteraction.findOne({ postId: postId });

        const response = NextResponse.json({
            claps: interaction?.claps?.length || 0,
            comments: interaction?.comments || [],
            hasClapped: interaction?.claps?.includes(userId) || false
        });

        // Set CORS headers
        response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        response.headers.set("Vary", "Origin");

        return response;
    } catch (error) {
        console.error("Error in GET /api/post-interaction:", error);
        return NextResponse.json(
            { error: 'Failed to fetch interaction data' },
            { status: 500 }
        );
    }
}

export function OPTIONS(request: NextRequest) {
    const corsRes = handleCors(request);
    return corsRes ?? new NextResponse(null, { status: 204 });
}