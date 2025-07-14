/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import PostInteraction from '@/model/postInteraction.model';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { handleCors } from '@/lib/cors';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const corsRes = handleCors(request);
    if (corsRes) return corsRes;

    try {
        const { postId } = await params;
        if (!postId) {
            const res = NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        await connect();

        const interaction = await PostInteraction.findOne({ postId });
        const comments = interaction?.comments || [];

        const res = NextResponse.json({
            comments: comments.slice(-10).reverse(),
            reachedLimit: comments.length >= 10
        });
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;

    } catch (error: any) {
        console.error('Error fetching comments:', error);
        const res = NextResponse.json(
            { error: error.message || 'Failed to fetch comments' },
            { status: 500 }
        );
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const corsRes = handleCors(request);
    if (corsRes) return corsRes;

    try {
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

        await verifyClerkToken(header);
        await connect();

        const { userId } = await auth();
        if (!userId) {
            const res = NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const User = await clerkClient();
        const user = await User.users.getUser(userId);
        const name = user.fullName || '';
        const imageUrl = user.imageUrl || '';

        const { content } = await request.json();

        if (!content || content.length > 500) {
            const res = NextResponse.json(
                { error: 'Comment must be between 1 and 500 characters' },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const existing = await PostInteraction.findOne({ postId: postId });
        if (existing?.comments?.length >= 10) {
            const res = NextResponse.json(
                { error: 'Maximum 10 comments allowed per post' },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const newComment = {
            userId,
            name,
            avatar: imageUrl,
            content,
        };

        const interaction = await PostInteraction.findOneAndUpdate(
            { postId: postId },
            { $push: { comments: newComment } },
            { upsert: true, new: true }
        );

        if (!interaction) throw new Error("Failed to add comment");

        const res = NextResponse.json({
            comments: interaction.comments.slice(-10),
            reachedLimit: interaction.comments.length >= 10
        });
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;

    } catch (error: any) {
        const res = NextResponse.json(
            { error: error.message || 'Failed to add comment' },
            { status: 500 }
        );
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const corsRes = handleCors(request);
    if (corsRes) return corsRes;

    try {
        const { postId } = await params;
        if (!postId) {
            const res = NextResponse.json(
                { error: 'Post ID is required' },
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

        await verifyClerkToken(header);
        await connect();

        const { userId } = await auth();
        if (!userId) {
            const res = NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const { commentId, content } = await request.json();
        if (!commentId || !content || content.length > 500) {
            const res = NextResponse.json(
                { error: 'Invalid comment data' },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const interaction = await PostInteraction.findOneAndUpdate(
            {
                postId,
                'comments._id': commentId,
                'comments.userId': userId
            },
            { $set: { 'comments.$.content': content } },
            { new: true }
        );

        if (!interaction) {
            const res = NextResponse.json(
                { error: 'Comment not found or not authorized' },
                { status: 404 }
            );
            res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const res = NextResponse.json({
            comments: interaction.comments.slice(-10),
            updatedComment: interaction.comments.find((c: { _id: any; }) => c._id === commentId)
        });
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;

    } catch (error: any) {
        console.error('Error in comment PUT:', error);
        const res = NextResponse.json(
            { error: error.message || 'Failed to update comment' },
            { status: 500 }
        );
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const corsRes = handleCors(request);
    if (corsRes) return corsRes;

    try {
        const { postId } = await params;
        if (!postId) {
            const res = NextResponse.json(
                { error: 'Post ID is required' },
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

        await verifyClerkToken(header);
        await connect();

        const { userId } = await auth();
        if (!userId) {
            const res = NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const { commentId } = await request.json();
        if (!commentId) {
            const res = NextResponse.json(
                { error: 'CommentId is required' },
                { status: 400 }
            );
            res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const interaction = await PostInteraction.findOneAndUpdate(
            {
                postId,
                'comments._id': commentId,
                'comments.userId': userId
            },
            { $pull: { comments: { _id: commentId } } },
            { new: true }
        );

        if (!interaction) {
            const res = NextResponse.json(
                { error: 'Comment not found or not authorized' },
                { status: 404 }
            );
            res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const res = NextResponse.json({
            comments: interaction.comments.slice(-10),
            reachedLimit: interaction.comments.length >= 10
        });
        res.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;

    } catch (error: any) {
        console.error('Error in comment DELETE:', error);
        const res = NextResponse.json(
            { error: error.message || 'Failed to delete comment' },
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