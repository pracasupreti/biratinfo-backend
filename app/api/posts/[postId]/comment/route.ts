/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import PostInteraction from '@/model/postInteraction.model';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const { postId } = await params;
        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            );
        }

        await connect();

        const interaction = await PostInteraction.findOne({ postId });
        const comments = interaction?.comments || [];

        return NextResponse.json({
            comments: comments.slice(-10).reverse(), // Return latest 10 comments in reverse order
            reachedLimit: comments.length >= 10
        });

    } catch (error: any) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;
    if (!postId) throw new Error("Post Id is required")

    const header = request.headers.get('Authorization')
    if (!header) throw new Error("Unauthorized")
    await verifyClerkToken(header);

    await connect();

    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
        );
    }

    const User = await clerkClient()
    const user = await User.users.getUser(userId)


    const name = user.fullName || '';
    const imageUrl = user.imageUrl || '';

    const { content } = await request.json();

    if (!content || content.length > 500) {
        return NextResponse.json(
            { error: 'Comment must be between 1 and 500 characters' },
            { status: 400 }
        );
    }

    try {
        const existing = await PostInteraction.findOne({ postId: postId });
        if (existing?.comments?.length >= 10) {
            return NextResponse.json(
                { error: 'Maximum 10 comments allowed per post' },
                { status: 400 }
            );
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

        if (!interaction) throw new Error("Failed to add comment")

        return NextResponse.json({
            comments: interaction.comments.slice(-10), // Return only last 10
            reachedLimit: interaction.comments.length >= 10
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to add comment' },
            { status: 500 }
        );
    }
}


export async function PUT(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const { postId } = await params;
        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            );
        }

        // Authentication
        const header = request.headers.get('Authorization');
        if (!header) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        await verifyClerkToken(header);
        await connect();

        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Validate input
        const { commentId, content } = await request.json();
        if (!commentId || !content || content.length > 500) {
            return NextResponse.json(
                { error: 'Invalid comment data' },
                { status: 400 }
            );
        }

        // Update comment
        const interaction = await PostInteraction.findOneAndUpdate(
            {
                postId,
                'comments._id': commentId,
                'comments.userId': userId // Ensure user owns the comment
            },
            { $set: { 'comments.$.content': content } },
            { new: true }
        );

        if (!interaction) {
            return NextResponse.json(
                { error: 'Comment not found or not authorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            comments: interaction.comments.slice(-10),
            updatedComment: interaction.comments.find((c: { _id: any; }) => c._id === commentId)
        });

    } catch (error: any) {
        console.error('Error in comment PUT:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update comment' },
            { status: 500 }
        );
    }
}


export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const { postId } = await params;
        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            );
        }

        // Authentication
        const header = request.headers.get('Authorization');
        if (!header) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        await verifyClerkToken(header);
        await connect();

        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const { commentId } = await request.json();
        if (!commentId) {
            return NextResponse.json(
                { error: 'CommentId is required' },
                { status: 400 }
            );
        }

        // Remove comment
        const interaction = await PostInteraction.findOneAndUpdate(
            {
                postId,
                'comments._id': commentId,
                'comments.userId': userId // Ensure user owns the comment
            },
            { $pull: { comments: { _id: commentId } } },
            { new: true }
        );

        if (!interaction) {
            return NextResponse.json(
                { error: 'Comment not found or not authorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            comments: interaction.comments.slice(-10),
            reachedLimit: interaction.comments.length >= 10
        });

    } catch (error: any) {
        console.error('Error in comment DELETE:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete comment' },
            { status: 500 }
        );
    }
}