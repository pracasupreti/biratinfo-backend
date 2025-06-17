import { getAuthor } from "@/actions/user.action";
import { verifyClerkToken } from "@/lib/auth";
import { connect } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const header = req.headers.get('Authorization')
    if (!header) throw new Error("Unauthorized")
    await verifyClerkToken(header);

    const { userId } = await params;
    if (!userId) throw new Error("Id is required")

    await connect();
    const result = await getAuthor(userId);

    if (!result.success) {
        return NextResponse.json(
            { error: result.message || 'Failed to fetch user' },
            { status: result.message === 'Unauthorized' ? 403 : 500 }
        );
    }

    return NextResponse.json({ user: result.user }, { status: 200 });
}