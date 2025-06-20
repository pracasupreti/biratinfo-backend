import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { Roles } from '@/types/globals';

// Define protected routes and their required roles
const protectedRoutes = [
    { path: '/admin', role: 'admin' },
    { path: '/editor', role: 'editor' },
    { path: '/manager', role: 'manager' },
];

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    '/',
    '/api/updateScheduledPost',
    '/api/webhooks(.*)',
    '/api/posts(.*)',
    '/api/public-posts(.*)',
    '/api/users',
    '/api/categories',
    '/api/active-banner'
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();
    const { pathname } = req.nextUrl;
    const userRole = sessionClaims?.metadata.role as Roles | undefined;

    // Allow CORS preflight to pass without redirection
    if (req.method === 'OPTIONS') {
        return NextResponse.next();
    }

    // 1. Handle public routes
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // 2. Redirect unauthenticated users
    if (!userId) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
    }

    // 3. Role-based access control
    const roleRedirects: Record<Roles, string> = {
        admin: '/admin',
        editor: '/editor',
        manager: '/manager',
    };

    // Handle users with no role or invalid role
    if (!userRole || !roleRedirects[userRole]) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Check if current route requires specific role
    const requiredRole = protectedRoutes.find(route =>
        pathname.startsWith(route.path)
    )?.role;

    if (requiredRole && userRole !== requiredRole) {
        // Redirect to their role-specific dashboard
        return NextResponse.redirect(new URL(roleRedirects[userRole], req.url));
    }

    // Allow access for all other cases
    return NextResponse.next();
});



// Middleware configuration - runs on all routes except static files
export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}