import { verifyApiKey } from "@/lib/auth";
import { connect } from "@/lib/db";
import Advertisement from "@/model/advertisement.model";
import { NextRequest, NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

export async function GET(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        verifyApiKey(req);
        await connect();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        const banner = await Advertisement.findOne({
            name: 'sponsor_banner',
            category,
            status: 'active'
        });

        const res = NextResponse.json(banner);

        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (error) {
        console.error('Error fetching banners:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banners' },
            { status: 500 }
        );
    }
}

export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
