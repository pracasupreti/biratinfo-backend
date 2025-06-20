/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { getFullPostByCategoryAndId } from '@/actions/post.action';
import { verifyApiKey } from '@/lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ category: string; id: string }> }
) {
    try {
        verifyApiKey(req);
        const { category, id } = await params;
        if (!category || !id) throw new Error("Category and ID are required");

        await connect();

        const post = await getFullPostByCategoryAndId(category, id);
        if (!post) throw new Error("Post not found or not approved");

        return NextResponse.json({ success: true, post }, { status: 200 });
    } catch (err: any) {
        console.error('Full post route error:', err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}
