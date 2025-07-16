import Category from "@/model/category.model";

export async function assignCategoryToApprovedPost(
    categoryName: string,
    postId: string,
    existingCategoryId?: number
): Promise<number> {
    const category = await Category.findOne({ category: categoryName });

    // If category doesn't exist, create it with this post
    if (!category) {
        await Category.create({
            category: categoryName,
            posts: [postId],
            postCount: 1,
            status: 'approved',
        });
        return 1;
    }

    // If post already exists in this category
    if (category.posts.includes(postId)) {
        // Return existing categoryId if passed
        if (existingCategoryId) return existingCategoryId;

        // Or calculate it from position
        const index = category.posts.findIndex(
            (id: string) => id.toString() === postId.toString()
        );
        return index >= 0 ? index + 1 : 1;
    }

    // Post not in category: push it and increment count
    const newCategoryId = category.postCount + 1;

    await Category.updateOne(
        { _id: category._id },
        {
            $inc: { postCount: 1 },
            $push: { posts: postId },
        }
    );

    return newCategoryId;
}
