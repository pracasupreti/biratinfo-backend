'use server'

import { connect } from '@/lib/db'
import Post from '@/model/post.model'
import { auth } from '@clerk/nextjs/server'
import { getDBId } from './user.action'



export async function submitPost(data: any) {
    const { userId } = await auth();
    const db_id = await getDBId();

    if (!userId) {
        return { success: false, message: 'Unauthorized' };
    }
    if (!db_id) {
        return { success: false, message: 'Error Getting database id' };
    }

    try {
        await connect();

        const existingPost = await Post.findOne({ englishTitle: data.englishTitle });
        if (existingPost) {
            return { success: false, message: 'Post already exists' };
        }

        // Step 1: Count posts in the same category
        const category = data.category;
        const postCount = await Post.countDocuments({ category });

        // Step 2: Set category-specific ID (starts from 1)
        const categoryId = postCount + 1;

        await Post.create({
            ...data,
            userId: db_id,
            categoryId,
        });

        return { success: true };
    } catch (error) {
        console.error('Post submission failed:', error);
        return { success: false, message: 'Database error' };
    }
}


export async function getPostByUser() {
    try {
        await connect();
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const db_id = await getDBId();
        if (!db_id) throw new Error('Error getting DB ID');

        const posts = await Post.find({ userId: db_id }).sort({ createdAt: -1 })
        return { success: true, posts };
    } catch (error) {
        console.error('Error getting posts by user:', error);
        return { success: false, message: 'Failed to fetch posts' };
    }
}

export async function getPostById(postId: string) {
    try {
        await connect();
        const post = await Post.findById(postId).lean();

        if (!post) {
            return { success: false, message: 'Post not found' };
        }

        // Deeply convert to plain JSON object
        const serializedPost = JSON.parse(JSON.stringify(post));

        return { success: true, serializedPost };
    } catch (error) {
        console.error('Error getting post by ID:', error);
        return { success: false, message: 'Failed to fetch post' };
    }
}

export async function getAllPostsByStatus(status: string) {
    try {
        await connect();
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        console.log(status)
        const posts = await Post.find({
            status: status
        }).sort({ createdAt: -1 }).lean(); //len converts non-serializable data into plain JSON object but cannot convert all so for some we need to do manually


        // Deeply convert to plain JSON object
        const serializedPost = JSON.parse(JSON.stringify(posts));


        return { success: true, posts: serializedPost };
    } catch (error) {
        console.error(`Error getting ${status} projects:`, error);
        return { success: false, message: `Failed to fetch ${status} projects` };
    }
}

export async function getPostsByStatus(status: string) {
    try {
        await connect();
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const db_id = await getDBId();
        if (!db_id) throw new Error('Error getting DB ID');
        console.log(db_id)
        console.log(status)
        const posts = await Post.find({
            userId: db_id,
            status: status
        }).sort({ createdAt: -1 }).lean(); //len converts non-serializable data into plain JSON object but cannot convert all so for some we need to do manually


        // Deeply convert to plain JSON object
        const serializedPost = JSON.parse(JSON.stringify(posts));


        return { success: true, posts: serializedPost };
    } catch (error) {
        console.error(`Error getting ${status} projects:`, error);
        return { success: false, message: `Failed to fetch ${status} projects` };
    }
}

export async function updatePost(postId: string, updatedData: any) {
    try {
        await connect();

        const { userId } = await auth();
        const db_id = await getDBId();
        if (!userId || !db_id) throw new Error('Unauthorized');

        if (!postId) throw new Error('Post ID is required');

        // Ensure postId is a valid ObjectId
        const mongoose = require('mongoose');
        const objectId = new mongoose.Types.ObjectId(postId);

        console.log(updatedData.heroBanner)

        // Check if a different post with the same title exists
        const existingPost = await Post.findOne({
            _id: { $ne: objectId },
            englishTitle: updatedData.englishTitle,
        });

        if (existingPost) throw new Error('A post with this title already exists');

        // Perform the update, ensuring ownership
        const post = await Post.findOneAndUpdate(
            { _id: objectId, userId: db_id },
            updatedData,
            { new: true, lean: true } // Return the updated post as a plain object
        );

        if (!post) {
            return { success: false, message: 'Post not found or not owned by user' };
        }

        // Return success
        return { success: true };
    } catch (error: any) {
        console.error('Error updating post:', error);
        return { success: false, message: error.message || 'Failed to update post' };
    }
}


export async function deletePost(postId: string) {
    try {
        await connect();

        const { userId } = await auth();
        const db_id = await getDBId();
        if (!userId || !db_id) throw new Error('Unauthorized');

        const result = await Post.findOneAndDelete({
            _id: postId,
            userId: db_id, // Ensure user owns the post
        });

        if (!result) {
            return { success: false, message: 'Post not found or unauthorized' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting post:', error);
        return { success: false, message: 'Failed to delete post' };
    }
}


