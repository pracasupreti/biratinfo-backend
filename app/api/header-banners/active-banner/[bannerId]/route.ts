import { verifyClerkToken } from "@/lib/auth";
import { connect } from "@/lib/db";
import Advertisement from "@/model/advertisement.model";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ bannerId: string }> }
) {
    const header = req.headers.get('Authorization')
    if (!header) throw new Error("Unauthorized")
    await verifyClerkToken(header);

    const { bannerId } = await params;
    if (!bannerId) throw new Error("Id is required")

    const { status, category } = await req.json();

    await connect();
    // 1. Deactivate all banners in that category
    await Advertisement.updateMany(
        { category, status: 'active', _id: { $ne: bannerId } },
        { $set: { status: 'inactive' } }
    );

    const updatedBanner = await Advertisement.findByIdAndUpdate(
        bannerId,
        { status },
        { new: true }
    );

    if (!updatedBanner) {
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 403 }
        );
    }

    return NextResponse.json({ status: 200 });
}

