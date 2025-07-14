import { verifyApiKey } from "@/lib/auth";
import { connect } from "@/lib/db";
import Tag from "@/model/tags.model";
import { NextRequest, NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

export async function GET(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        verifyApiKey(req);
        await connect();

        const tags = await Tag.find().sort({ count: -1 });

        const res = NextResponse.json(tags);
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (error) {
        console.error("Error fetching tags:", error);
        return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}

export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
