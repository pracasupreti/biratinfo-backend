import { getCategories } from "@/actions/category.action";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log("Route Hit");

        const result = await getCategories();
        console.log("result", result);

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
