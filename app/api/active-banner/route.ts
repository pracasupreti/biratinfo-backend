// app/api/banner/active/route.ts
import { verifyApiKey, verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import Advertisement from '@/model/advertisement.model';
import { NextResponse } from 'next/server';

const VALID_NAMES = ['header_banner', 'sponsor_banner'];

export async function POST(request: Request) {
    try {
        const header = request.headers.get('Authorization')
        if (!header) throw new Error("Unauthorized")
        await verifyClerkToken(header);
        await connect();
        const { url, name } = await request.json();

        if (!url || !name) {
            return NextResponse.json(
                { error: 'Both URL and banner name are required' },
                { status: 400 }
            );
        }

        if (!VALID_NAMES.includes(name)) {
            return NextResponse.json(
                { error: `Invalid banner name. Valid names are: ${VALID_NAMES.join(', ')}` },
                { status: 400 }
            );
        }

        // Upsert the banner (create or update in one operation)
        const updatedBanner = await Advertisement.findOneAndUpdate(
            { name }, // Filter by name
            { url },  // Update the URL
            {
                upsert: true,    // Create if doesn't exist
                new: true,       // Return the updated document
                setDefaultsOnInsert: true
            }
        );

        if (!updatedBanner) throw new Error('Faile to create or update banner')

        return NextResponse.json({
            message: `${name} ${updatedBanner.wasCreated ? 'created' : 'updated'} successfully`,
            banner: updatedBanner
        }, { status: updatedBanner.wasCreated ? 201 : 200 });

    } catch (error) {
        console.error('Error managing banner:', error);
        return NextResponse.json(
            { error: 'Failed to manage banner' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        verifyApiKey(request);
        await connect();
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (name) {
            if (!VALID_NAMES.includes(name)) {
                return NextResponse.json(
                    { error: 'Invalid banner name' },
                    { status: 400 }
                );
            }
            const banner = await Advertisement.findOne({ name });
            return NextResponse.json(banner);
        } else {
            throw new Error("Banner name is required")
        }
    } catch (error) {
        console.error('Error fetching banners:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banners' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        await connect();
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (name) {
            if (!VALID_NAMES.includes(name)) {
                return NextResponse.json(
                    { error: 'Invalid banner name' },
                    { status: 400 }
                );
            }
            const result = await Advertisement.deleteOne({ name });
            return NextResponse.json({
                message: result.deletedCount > 0
                    ? `${name} deleted successfully`
                    : `${name} not found`
            });
        } else {
            const result = await Advertisement.deleteMany({ name: { $in: VALID_NAMES } });
            return NextResponse.json({
                message: `Deleted ${result.deletedCount} banners`
            });
        }
    } catch (error) {
        console.error('Error deleting banner:', error);
        return NextResponse.json(
            { error: 'Failed to delete banner' },
            { status: 500 }
        );
    }
}