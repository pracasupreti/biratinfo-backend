/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import { updatePost } from '@/actions/post.action';

export async function PUT(req: Request) {
    try {
        const header = req.headers.get('Authorization')
        if (!header) throw new Error("Unauthorized")
        await verifyClerkToken(header);

        const body = await req.json();
        if (!body) throw new Error("Body parameters are required")

        const { id, ...data } = body;
        if (!id) {
            return NextResponse.json({ success: false, message: 'Post ID is required' }, { status: 400 });
        }

        await connect();
        const updatedPost = await updatePost(id, data);

        return NextResponse.json({ success: true, post: updatedPost }, { status: 200 });

    } catch (err: any) {
        console.error('Update post error:', err.message);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
