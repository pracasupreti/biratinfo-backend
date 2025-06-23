// lib/role.ts
import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'


export const checkRole = async (role: Roles) => {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        throw new Error('Unauthorized: User not authenticated');
    }

    const userRole = sessionClaims?.metadata?.role as Roles;

    if (!userRole) {
        throw new Error('Unauthorized: User role not found');
    }

    if (userRole !== role) {
        throw new Error(`Unauthorized: Requires ${role} role`);
    }

    return true;
};



