'use server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import slugify from 'slugify'
import User from '@/model/user.model'
import { connect } from '@/lib/db'
import Post from '@/model/post.model'

async function generateUniqueUsername(firstName: string, lastName: string) {
    let base = slugify(`${firstName || 'user'} ${lastName || ''}`, { lower: true });
    if (!base) base = 'user';

    let username = base;
    let counter = 1;

    while (await User.findOne({ username })) {
        username = `${base}${counter}`;
        counter++;
    }

    return username;
}

//create new user
export async function handleUserCreated(user: any) {
    try {
        await connect()

        // Assign default role in Clerk
        const client = await clerkClient();
        await client.users.updateUser(user.id, {
            publicMetadata: {
                role: 'manager',
            },
        })

        // Save user to MongoDB
        const { id, email_addresses, first_name, last_name, username: existingUsername, image_url } = user

        const existingUser = await User.findOne({ clerkId: id })
        if (existingUser) {
            return { success: false, message: 'User already exists' }
        }

        // Generate and assign unique username if missing
        let finalUsername = existingUsername;

        if (!existingUsername) {
            finalUsername = await generateUniqueUsername(first_name, last_name);

            // Update username in Clerk
            await client.users.updateUser(id, {
                username: finalUsername,
            });
        }

        const newUser = {
            clerkId: id,
            email: email_addresses?.[0]?.email_address,
            firstName: first_name,
            lastName: last_name,
            username: finalUsername || '',
            role: 'manager',
            avatar: image_url

        }
        const response = await User.create(newUser);
        console.log(`User ${user.id} created with role manager.`)
        return JSON.parse(JSON.stringify(newUser))


    } catch (error) {
        console.error('Error in handleUserCreated:', error)
    }
}

//update user
export async function handleUserUpdated(user: any) {
    try {
        await connect()

        const updateData: any = {
            email: user.email_addresses?.[0]?.email_address,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username || '',
            role: user.public_metadata?.role || 'manager',
        };

        // Only update avatar if it exists in the Clerk user object
        if (user.image_url) {
            updateData.avatar = user.image_url;
        }
        await User.updateOne(
            { clerkId: user.id },
            updateData
        )

        console.log(`User ${user.id} updated with new role ${user.public_metadata?.role}`)
    } catch (error) {
        console.error('Error in handleUserUpdated:', error)
    }
}


//delete user
export async function handleUserDeleted(user: any) {
    try {
        await connect()

        const response = await User.deleteOne({ clerkId: user.id })
        console.log(response)

        console.log(`User ${user.id} deleted from database.`)
    } catch (error) {
        console.error('Error in handleUserDeleted:', error)
    }
}


export async function getDBId() {
    try {
        await connect();

        const { userId } = await auth();

        if (!userId) {
            throw new Error('Unauthorized');
        }

        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            throw new Error('User not found in DB');
        }

        return user._id;
    } catch (error) {
        console.error('[getDBId] Error:', error);
        return null;
    }
}

export async function getDBIdByClerId(userId: string) {
    try {
        await connect();

        if (!userId) {
            throw new Error('Unauthorized');
        }

        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            throw new Error('User not found in DB');
        }

        return user._id;
    } catch (error) {
        console.error('[getDBId] Error:', error);
        return null;
    }
}

export async function getClerkIdByUsername(username: string) {
    try {
        await connect();

        if (!username) {
            throw new Error('Unauthorized');
        }

        const user = await User.findOne({ username });

        if (!user) {
            throw new Error('User not found in DB');
        }

        return user.clerkId;
    } catch (error) {
        console.error('[getDBId] Error:', error);
        return null;
    }
}

export async function getAuthors() {
    try {
        const { userId } = await auth();

        if (!userId) {
            throw new Error('Unauthorized');
        }

        const User = await clerkClient();
        const currentUser = await User.users.getUser(userId);
        const currentUserRole = currentUser.publicMetadata?.role as string;

        // Determine permitted roles based on current user role
        const roleAccessMap: Record<string, string[]> = {
            manager: ['manager'],
            editor: ['editor', 'manager'],
            admin: ['editor', 'manager'],
        };

        const permittedRoles = roleAccessMap[currentUserRole] ?? [];

        if (permittedRoles.length === 0) {
            return { success: true, users: [] }; // No access
        }

        const users = await User.users.getUserList({ limit: 100 });

        const formattedUsers = users.data
            .filter(user => permittedRoles.includes(user.publicMetadata?.role as string))
            .map(user => ({
                id: user.id,
                name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
                imageUrl: user.imageUrl,
                role: user.publicMetadata?.role ?? '',
            }));

        return { success: true, users: formattedUsers };

    } catch (error) {
        console.error('Error fetching users:', error);
        return { success: false, message: 'Failed to fetch users' };
    }
}

export async function getAuthor(userId: string) {
    try {
        const { userId } = await auth();

        if (!userId) {
            throw new Error('Unauthorized');
        }

        const User = await clerkClient();
        const user = await User.users.getUser(userId);

        return {
            success: true,
            user: {
                id: user.id,
                name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
                imageUrl: user.imageUrl,
                role: user.publicMetadata?.role ?? ''
            }
        };
    } catch (error) {
        console.error('Error fetching current user:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch current user'
        };
    }
}

export async function getAuthorById(userId: string) {
    try {
        if (!userId) {
            throw new Error('Unauthorized');
        }

        const User = await clerkClient();
        const user = await User.users.getUser(userId);

        return {
            success: true,
            user: {
                id: user.id,
                name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
                imageUrl: user.imageUrl,
                role: user.publicMetadata?.role ?? ''
            }
        };
    } catch (error) {
        console.error('Error fetching current user:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch current user'
        };
    }
}

export async function getAuthorDetails(username: string) {
    try {
        await connect();

        // 1. Get basic user info from Clerk

        const clerkId = await getClerkIdByUsername(username)

        const user = await User.findOne({ clerkId })
        if (!user) throw new Error("User not found")

        // 2. Get all posts by this author (sorted by latest first)
        const posts = await Post.find({ authors: { $in: [clerkId] } })
            .sort({ createdAt: -1 })
            .select('title excerpt category categoryId heroBanner ogBanner createdAt updatedAt readingTime')
            .lean();

        // 3. Calculate total post count and read count
        const totalPosts = posts.length;

        // 4. Get top 3 categories
        const categoryCounts: Record<string, number> = {};
        posts.forEach(post => {
            categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
        });

        const topCategories = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);

        // 5. Format the response
        const userData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            imageUrl: user.avatar,
            joinedDate: user.createdAt,
            bio: user.bio,
            socialLinks: user.socialLinks,
            totalPosts,
            topCategories,
            allposts: posts
        }

        return userData;

    } catch (error) {
        console.error('Error fetching author details:', error);
        throw error;
    }
}



