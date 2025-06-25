/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/auth';
import { getAuthorDetails } from '@/actions/user.action';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ authorId: string }> }
) {
    try {
        verifyApiKey(req);
        const { authorId } = await params;

        if (!authorId) {
            throw new Error("Author ID is required");
        }

        const authorDetails = await getAuthorDetails(authorId);
        if (!authorDetails) {
            return NextResponse.json(
                { error: 'Failed to fetch user details' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, author: authorDetails },
            { status: 200 }
        );

    } catch (err: any) {
        console.error('Author details route error:', err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}