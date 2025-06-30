import { verifyApiKey } from "@/lib/auth";
import { connect } from "@/lib/db";
import Advertisement from "@/model/advertisement.model";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        console.log("ROUTE HIT")
        verifyApiKey(request)
        await connect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');


        const banner = await Advertisement.findOne({ category, status: 'active' });
        return NextResponse.json(banner);
    } catch (error) {
        console.error('Error fetching banners:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banners' },
            { status: 500 }
        );
    }
}