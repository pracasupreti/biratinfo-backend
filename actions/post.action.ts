'use server'

import { connect } from '@/lib/db'
import Post from '@/model/post.model'
import { auth } from '@clerk/nextjs/server'
import { getDBId, getDBIdByClerId } from './user.action'
import Category from '@/model/category.model'
import { NextResponse } from 'next/server'


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

        // Adding Category Document
        let categoryId: number | undefined;
        let objectId;

        if (data.status === 'approved') {
            const mongoose = require('mongoose');
            objectId = new mongoose.Types.ObjectId();

            const category = data.category;
            let categoryDoc = await Category.findOne({ category });

            if (!categoryDoc) {
                categoryId = 1;
                categoryDoc = await Category.create({
                    category,
                    posts: [objectId],
                    postCount: 1,
                    status: 'approved',
                });
            } else {
                categoryId = categoryDoc.postCount + 1;
                await Category.updateOne(
                    { _id: categoryDoc._id },
                    {
                        $inc: { postCount: 1 },
                        $push: { posts: objectId }
                    }
                );
            }
            if (!data.sponsoredAds || data.sponsoredAds.trim() === '') {
                data.sponsoredAds = 'https://res.cloudinary.com/biratinfo/image/upload/v1749053676/posts/9d870052-32f7-408a-8cf7-394a483edbe9.jpg';
            }
        }


        const result = await Post.create({
            ...(objectId ? { _id: objectId } : {}),
            ...data,
            userId: db_id,
            ...(categoryId && { categoryId })
        });

        if (!result) {
            return { success: false }
        }

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

        const mongoose = require('mongoose');
        const objectId = new mongoose.Types.ObjectId(postId);

        const existing = await Post.findById(objectId);
        if (!existing) throw new Error('Post not found');

        const existingPost = await Post.findOne({
            _id: { $ne: objectId },
            englishTitle: updatedData.englishTitle,
            status: 'approved',
        });

        if (existingPost) {
            return { success: false, message: 'A post with this title already exists', code: 409 }
        }


        //Adding Category document
        if (updatedData.status === 'approved') {
            const category = updatedData.category;

            // Find existing category
            let categoryDoc = await Category.findOne({ category });

            let categoryId;

            if (!categoryDoc) {
                categoryId = 1;

                categoryDoc = await Category.create({
                    category,
                    posts: [objectId],
                    postCount: 1,
                    status: 'approved',
                });
            } else {
                categoryId = categoryDoc.postCount + 1;

                await Category.updateOne(
                    { _id: categoryDoc._id },
                    {
                        $inc: { postCount: 1 },
                        $push: { posts: objectId }
                    }
                );
            }

            updatedData.categoryId = categoryId;

            if (!updatedData.sponsoredAds || updatedData.sponsoredAds.trim() === '') {
                updatedData.sponsoredAds = 'https://res.cloudinary.com/biratinfo/image/upload/v1749053676/posts/9d870052-32f7-408a-8cf7-394a483edbe9.jpg';
            }
        }




        const post = await Post.findOneAndUpdate(
            { _id: objectId },
            updatedData,
            { new: true, lean: true }
        );

        if (!post) {
            return { success: false, message: 'Post not found or not owned by user' };
        }

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

export async function getApprovedPostCountByUser(userId: string) {
    try {
        await connect();
        const db_id = await getDBIdByClerId(userId);
        if (!db_id) throw new Error('Error getting DB ID');

        const count = await Post.countDocuments({
            userId: db_id,
            status: 'approved',
        });

        return { success: true, count };
    } catch (error) {
        console.error('Error fetching approved post count:', error);
        return { success: false, message: 'Failed to get post count' };
    }
}



