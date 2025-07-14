import { NextRequest, NextResponse } from "next/server";
import { getApprovedPostCountByUser } from "@/actions/post.action";
import { verifyClerkToken } from "@/lib/auth";
import { handleCors } from "@/lib/cors";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const token = req.headers.get('Authorization');
        if (!token) {
            const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        await verifyClerkToken(token);

        const { userId } = await params;
        const result = await getApprovedPostCountByUser(userId);

        if (!result.success) {
            const res = NextResponse.json({ error: result.message }, { status: 500 });
            res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
            res.headers.set("Vary", "Origin");
            return res;
        }

        const res = NextResponse.json({ count: result.count }, { status: 200 });
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    } catch (error) {
        console.error("API Error:", error);
        const res = NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");
        return res;
    }
}

export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}