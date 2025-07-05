import { getCategories } from "@/actions/category.action";
import { verifyClerkToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const header = request.headers.get('Authorization')
        if (!header) throw new Error("Unauthorized")
        await verifyClerkToken(header);
        const result = await getCategories();

        if (!result.success) {
            return NextResponse.json(
                { error: result.message || 'Failed to fetch categories' },
                { status: 500 }
            );
        }

        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error("GET /categories error:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
