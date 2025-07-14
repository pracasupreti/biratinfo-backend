/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/auth';
import { getAuthorDetails } from '@/actions/user.action';
import { handleCors } from '@/lib/cors';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        verifyApiKey(req);

        const { username } = await params;
        if (!username) throw new Error("Username is required");

        const authorDetails = await getAuthorDetails(username);

        if (!authorDetails) {
            return NextResponse.json(
                { error: "Failed to fetch user details" },
                { status: 500 }
            );
        }

        const res = NextResponse.json(
            { success: true, author: authorDetails },
            { status: 200 }
        );

        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (err: any) {
        console.error("Author details route error:", err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}

export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
