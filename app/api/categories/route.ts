import { getCategories } from "@/actions/category.action";
import { verifyClerkToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

export async function GET(req: NextRequest) {
    // Handle CORS preflight and headers early
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get("Authorization");
        if (!header) throw new Error("Unauthorized");

        await verifyClerkToken(header);
        const result = await getCategories();

        if (!result.success) {
            return NextResponse.json(
                { error: result.message || "Failed to fetch categories" },
                { status: 500 }
            );
        }

        const res = NextResponse.json({ result }, { status: 200 });

        // Set CORS headers on success response
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (error) {
        console.error("GET /categories error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// Preflight CORS handler
export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
