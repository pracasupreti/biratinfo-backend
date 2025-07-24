import { getAuthorById } from "@/actions/user.action";
import { verifyClerkToken } from "@/lib/auth";
import { connect } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get('Authorization');
        if (!header) throw new Error("Unauthorized");
        await verifyClerkToken(header);

        const { userId } = await params;
        if (!userId) throw new Error("Id is required");

        await connect();
        const result = await getAuthorById(userId);

        if (!result.success) {
            const response = NextResponse.json(
                { error: result.message || 'Failed to fetch user' },
                { status: result.message === 'Unauthorized' ? 403 : 500 }
            );
            response.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
            response.headers.set("Vary", "Origin");
            return response;
        }

        const res = NextResponse.json({ user: result.user }, { status: 200 });
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    } catch (error) {
        const response = NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
        response.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        response.headers.set("Vary", "Origin");
        return response;
    }
}

export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}