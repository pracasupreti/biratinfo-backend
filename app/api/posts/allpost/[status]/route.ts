/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import { getAllPostsByStatus } from '@/actions/post.action';

const ALLOWED_STATUSES = new Set(['draft', 'pending', 'approved', 'scheduled', 'rejected']);

export async function GET(
    req: Request,
    { params }: { params: Promise<{ status: string }> }
) {
    try {
        // Token verification (throws if invalid)
        const header = req.headers.get('Authorization')
        if (!header) throw new Error("Unauthorized")
        await verifyClerkToken(header);

        const { status } = await params;
        if (!ALLOWED_STATUSES.has(status)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid status parameter',
                allowedStatuses: Array.from(ALLOWED_STATUSES),
            }, { status: 400 });
        }

        await connect();

        const posts = await getAllPostsByStatus(status);
        return NextResponse.json({ success: true, posts }, { status: 200 });

    } catch (err: any) {
        console.error('Status route error:', err.message);
        return NextResponse.json({ success: false, message: err.message }, {
            status: err.message.includes('token') ? 401 : 500
        });
    }
}
