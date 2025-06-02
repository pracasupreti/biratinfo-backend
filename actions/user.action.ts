'use server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import User from '@/model/user.model'
import { connect } from '@/lib/db'

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
        const { id, email_addresses, first_name, last_name } = user

        const existingUser = await User.findOne({ clerkId: id })
        if (existingUser) {
            return { success: false, message: 'User already exists' }
        }
        const newUser = {
            clerkId: id,
            email: email_addresses?.[0]?.email_address,
            firstName: first_name,
            lastName: last_name,
            role: 'manager'

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

        await User.updateOne(
            { clerkId: user.id },
            {
                email: user.email_addresses?.[0]?.email_address,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.public_metadata?.role || 'manager', // keep it in sync with Clerk
            }
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
