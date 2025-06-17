import { NextRequest, NextResponse } from "next/server";
import { getApprovedPostCountByUser } from "@/actions/post.action";
import { verifyClerkToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const token = req.headers.get('Authorization');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await verifyClerkToken(token);

        const { userId } = await params;
        const result = await getApprovedPostCountByUser(userId);

        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 500 });
        }

        return NextResponse.json({ count: result.count }, { status: 200 });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
