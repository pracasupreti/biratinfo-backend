import { verifyApiKey } from "@/lib/auth";
import { connect } from "@/lib/db";
import Tag from "@/model/tags.model";


import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        verifyApiKey(request);
        await connect();

        const tags = await Tag.find().sort({ count: -1 });

        return NextResponse.json(tags);
    } catch (error) {
        console.error("Error fetching tags:", error);
        return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}

