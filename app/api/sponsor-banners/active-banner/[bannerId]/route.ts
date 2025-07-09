import { verifyClerkToken } from "@/lib/auth";
import { connect } from "@/lib/db";
import Advertisement from "@/model/advertisement.model";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ bannerId: string }> }
) {
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
        {
            name: 'sponsor_banner',
            category,
            status: "active",
            _id: { $ne: objectId }
        },
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

    return NextResponse.json({ status: 200 });
}
