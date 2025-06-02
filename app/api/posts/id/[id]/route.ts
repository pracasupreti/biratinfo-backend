/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import { getPostById, } from '@/actions/post.action';


export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Token verification (throws if invalid)
        const header = req.headers.get('Authorization')
        if (!header) throw new Error("Unauthorized")
        await verifyClerkToken(header);

        const { id } = await params;
        if (!id) throw new Error("Id is required")

        await connect();

        const posts = await getPostById(id);
        return NextResponse.json({ success: true, posts }, { status: 200 });

    } catch (err: any) {
        console.error('Status route error:', err.message);
        return NextResponse.json({ success: false, message: err.message }, {
            status: err.message.includes('token') ? 401 : 500
        });
    }
}
