import { getAuthors } from "@/actions/user.action";
import { verifyClerkToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const header = req.headers.get('Authorization')
        if (!header) throw new Error("Unauthorized")
        await verifyClerkToken(header);
        const result = await getAuthors();

        if (!result.success) {
            return NextResponse.json(
                { error: result.message || "Failed to fetch users" },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { users: result.users },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in GET /api/authors:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
