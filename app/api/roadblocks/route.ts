/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyClerkToken } from "@/lib/auth";
import { checkRole } from "@/lib/role";
import { NextRequest, NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";
import { createRoadBlock, getAllRoadblocks } from "@/actions/roadblock.action";

export async function GET(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get("Authorization");
        if (!header) throw new Error("Unauthorized");

        await verifyClerkToken(header);
        await checkRole("admin");

        const networks = await getAllRoadblocks();
        if (!networks) throw new Error("Roadblocks not found or not approved");

        const res = NextResponse.json({ success: true, data: networks }, { status: 200 });

        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (err: any) {
        console.error("Get roadblock error:", err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: err.statusCode || 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get("Authorization");
        if (!header) throw new Error("Unauthorized");

        await verifyClerkToken(header);
        await checkRole("admin");

        const body = await req.json();
        const roadblock = await createRoadBlock(body);
        if (!roadblock.success) throw new Error("Roadblock not found or not approved");

        const res = NextResponse.json({ success: true, data: roadblock }, { status: 201 });

        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (err: any) {
        console.error("Create roadblock error:", err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: err.statusCode || 500 }
        );
    }
}

// OPTIONS handler for preflight
export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
