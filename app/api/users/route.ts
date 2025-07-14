import { getAuthors } from "@/actions/user.action";
import { verifyClerkToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

export async function GET(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get("Authorization");
        if (!header) throw new Error("Unauthorized");
        await verifyClerkToken(header);

        const result = await getAuthors();

        if (!result.success) {
            return NextResponse.json(
                { error: result.message || "Failed to fetch users" },
                { status: 403 }
            );
        }

        const res = NextResponse.json({ users: result.users }, { status: 200 });
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (error) {
        console.error("Error in GET /api/authors:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
