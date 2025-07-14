import { verifyClerkToken } from "@/lib/auth";
import { connect } from "@/lib/db";
import Advertisement from "@/model/advertisement.model";
import { NextRequest, NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ bannerId: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get('Authorization');
        if (!header) throw new Error("Unauthorized");
        await verifyClerkToken(header);

        const { bannerId } = await params;
        if (!bannerId) throw new Error("Id is required");

        const { link } = await req.json();

        await connect();

        const updatedBanner = await Advertisement.findByIdAndUpdate(
            bannerId,
            { $set: { link } },
            { new: true }
        );

        if (!updatedBanner) {
            return NextResponse.json(
                { error: 'Failed to update status' },
                { status: 403 }
            );
        }

        const res = NextResponse.json({ status: 200 });
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (error) {
        console.error("PATCH banner link error:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
