/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { getLatestSummary } from '@/actions/post.action';
import { verifyApiKey } from '@/lib/auth';

export async function GET(
    req: Request,) {
    try {
        verifyApiKey(req);

        await connect();

        const post = await getLatestSummary([
            'tourism',
            'technology',
            'economy',
            'agriculture',
            'lifestyle',
            'sports',
            'health',
            'education',
            'entertainment',
            'culture'
        ]);

        if (!post) throw new Error("No approved posts found");

        return NextResponse.json({ success: true, post }, { status: 200 });
    } catch (err: any) {
        console.error('Summary route error:', err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}
