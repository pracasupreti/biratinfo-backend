import { verifyApiKey, verifyClerkToken } from '@/lib/auth';
import { connect } from '@/lib/db';
import Advertisement from '@/model/advertisement.model';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { handleCors } from '@/lib/cors';

export async function POST(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get('Authorization');
        if (!header) throw new Error('Unauthorized');
        await verifyClerkToken(header);
        await connect();

        const { url, name, category, link, status } = await req.json();

        if (!url || !name) {
            return NextResponse.json(
                { error: 'Both URL and banner name are required' },
                { status: 400 }
            );
        }

        const existingDocument = await Advertisement.findOne({ url, category });
        if (existingDocument) throw new Error('Document Already exists');

        const newBanner = await Advertisement.create({
            url,
            name,
            category,
            status,
            link,
        });

        if (!newBanner) throw new Error('Failed to create banner');

        const res = NextResponse.json(
            {
                message: `${name} ${newBanner.wasCreated ? 'created' : 'updated'} successfully`,
                banner: newBanner,
            },
            { status: newBanner.wasCreated ? 201 : 200 }
        );

        res.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
        res.headers.set('Vary', 'Origin');

        return res;
    } catch (error) {
        console.error('Error managing banner:', error);
        return NextResponse.json({ error: 'Failed to manage banner' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        verifyApiKey(req);
        await connect();

        const banner = await Advertisement.find({ name: 'header_banner' });

        const res = NextResponse.json(banner);

        res.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
        res.headers.set('Vary', 'Origin');

        return res;
    } catch (error) {
        console.error('Error fetching banners:', error);
        return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get('Authorization');
        if (!header) throw new Error('Unauthorized');
        await verifyClerkToken(header);
        await connect();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing banner ID' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid banner ID format' }, { status: 400 });
        }

        const objectId = new mongoose.Types.ObjectId(id);
        const result = await Advertisement.findByIdAndDelete(objectId);

        if (!result) {
            return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
        }

        const res = NextResponse.json({ message: `Banner with ID ${id} deleted successfully` });

        res.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
        res.headers.set('Vary', 'Origin');

        return res;
    } catch (error) {
        console.error('Error deleting banner:', error);
        return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
    }
}

// Preflight CORS handler for all methods
export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
