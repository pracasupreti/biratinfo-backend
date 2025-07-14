/* eslint-disable @typescript-eslint/no-explicit-any */
import { createNetwork, getAllNetworks } from "@/actions/network.action";
import { verifyClerkToken } from "@/lib/auth";
import { checkRole } from "@/lib/role";
import { NextRequest, NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

export async function GET(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get("Authorization");
        if (!header) throw new Error("Unauthorized");

        await verifyClerkToken(header);
        await checkRole("admin");

        const networks = await getAllNetworks();
        if (!networks) throw new Error("Networks not found or not approved");

        const res = NextResponse.json({ success: true, data: networks }, { status: 200 });

        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (err: any) {
        console.error("Get networks error:", err.message);
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
        const network = await createNetwork(body);
        if (!network.success) throw new Error("Networks not found or not approved");

        const res = NextResponse.json({ success: true, data: network }, { status: 201 });

        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (err: any) {
        console.error("Create network error:", err.message);
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
