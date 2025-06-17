import { connect } from "@/lib/db";
import Category from "@/model/category.model";
import { auth } from "@clerk/nextjs/server";

export async function getCategories() {
    try {
        await connect();
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const categories = await Category.find({})

        return { success: true, categories: categories };
    } catch (error) {
        console.error(`Error getting categories:`, error);
        return { success: false, message: `Failed to fetch categories` };
    }
}
