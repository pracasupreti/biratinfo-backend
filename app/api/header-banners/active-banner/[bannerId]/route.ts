/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyClerkToken } from "@/lib/auth";
import { connect } from "@/lib/db";
import Advertisement from "@/model/advertisement.model";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { handleCors } from "@/lib/cors";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ bannerId: string }> }
) {
    // Handle CORS preflight and headers early
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get("Authorization");
        if (!header) throw new Error("Unauthorized");
        await verifyClerkToken(header);

        const { bannerId } = await params;
        if (!bannerId) throw new Error("Id is required");

        const { status, category } = await req.json();
        const objectId = new Types.ObjectId(bannerId);

        await connect();

        // Set all others to inactive
        await Advertisement.updateMany(
            { name: "header_banner", category, status: "active", _id: { $ne: objectId } },
            { $set: { status: "inactive" } }
        );

        // Set current to active
        const updatedBanner = await Advertisement.findByIdAndUpdate(
            objectId,
            { status },
            { new: true }
        );

        if (!updatedBanner) {
            return NextResponse.json({ error: "Failed to update status" }, { status: 403 });
        }

        const res = NextResponse.json({ status: 200 });

        // Set CORS headers on success response
        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (error: any) {
        console.error("PATCH /banner error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

// Preflight CORS handler
export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
