/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyApiKey, verifyClerkToken } from "@/lib/auth";
import { connect } from "@/lib/db";
import User from "@/model/user.model";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        verifyApiKey(req);

        const { userId } = await params;
        if (!userId) throw new Error("User ID is required");

        await connect();
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const res = NextResponse.json({
            bio: user.bio || '',
            socialLinks: user.socialLinks || {}
        });

        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch user metadata' },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get('Authorization');

        if (!header) throw new Error("Unauthorized");
        await verifyClerkToken(header);

        const { userId } = await params;
        if (!userId) throw new Error("User ID is required");

        const { userId: authUserId } = await auth();
        if (userId !== authUserId) {
            return NextResponse.json(
                { error: 'Unauthorized to update this user' },
                { status: 403 }
            );
        }

        const { bio, socialLinks } = await req.json();

        // Validate bio length (100 words max)
        if (bio && bio.split(/\s+/).length > 100) {
            return NextResponse.json(
                { error: 'Bio must be 100 words or less' },
                { status: 400 }
            );
        }

        await connect();
        const updatedUser = await User.findOneAndUpdate(
            { clerkId: userId },
            {
                $set: {
                    bio,
                    socialLinks: socialLinks || {}
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const res = NextResponse.json({
            success: true,
            bio: updatedUser.bio,
            socialLinks: updatedUser.socialLinks
        });

        res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
        res.headers.set("Vary", "Origin");

        return res;
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to update user metadata' },
            { status: 500 }
        );
    }
}

export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}