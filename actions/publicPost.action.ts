'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect } from '@/lib/db';
import PublicPost from '@/model/publicPost.model';

import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.PUBLIC_SECRET_HASH!; // hashed version of the secret key

export async function submitPublicPost(data: any, headers: Headers) {
    const rawKey = headers.get('x-special-key');


    if (!rawKey) {
        return { success: false, message: 'Unauthorized' };
    }



    try {
        await connect();

        const existingPost = await PublicPost.findOne({ englishTitle: data.englishTitle });
        if (existingPost) {
            return { success: false, message: 'Post already exists' };
        }

        console.log("existingPost", existingPost)

        await PublicPost.create(data);

        return { success: true, message: 'Post created successfully' };
    } catch (error) {
        console.error('Public post submission failed:', error);
        return { success: false, message: 'Database error' };
    }
}
