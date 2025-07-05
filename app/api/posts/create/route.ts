/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import { submitPost } from '@/actions/post.action';

export async function POST(req: Request) {
    try {
        const header = req.headers.get('Authorization')
        if (!header) throw new Error("Unauthorized")
        await verifyClerkToken(header);
        const body = await req.json();

        if (!body) throw new Error("Body parameters are required")

        await connect();

        const newPost = await submitPost(body);
        if (!newPost.success) {
            return NextResponse.json(
                { success: false, message: newPost.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, post: newPost }, { status: 201 });

    } catch (err: any) {
        console.error('Create post error:', err.message);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
