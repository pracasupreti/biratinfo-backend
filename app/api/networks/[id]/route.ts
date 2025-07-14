/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { getNetworkById, updateNetwork } from '@/actions/network.action';
import { checkRole } from '@/lib/role';
import { handleCors } from '@/lib/cors';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const header = req.headers.get('Authorization');
        if (!header) throw new Error('Unauthorized');
        await verifyClerkToken(header);

        const { id } = await params;
        if (!id) throw new Error('Id is required');

        const data = await getNetworkById(id);

        const res = NextResponse.json({ success: true, data }, { status: 200 });

        res.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
        res.headers.set('Vary', 'Origin');

        return res;
    } catch (err: any) {
        console.error('Status route error:', err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: err.message.includes('token') ? 401 : 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const corsRes = handleCors(req);
    if (corsRes) return corsRes;

    try {
        const { id } = await params;
        if (!id) throw new Error('Id is required');
        const header = req.headers.get('Authorization');
        if (!header) throw new Error('Unauthorized');

        await verifyClerkToken(header);
        await checkRole('admin');

        const updatedData = await req.json();
        if (!updatedData) throw new Error('Body parameters are required');

        const network = await updateNetwork(id, updatedData);
        if (!network.success) throw new Error('Networks not found or not approved');

        const res = NextResponse.json({ success: true, data: network }, { status: 201 });

        res.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
        res.headers.set('Vary', 'Origin');

        return res;
    } catch (err: any) {
        console.error('Create network error:', err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: err.statusCode || 500 }
        );
    }
}

// Preflight handler for both GET and PUT
export function OPTIONS(req: NextRequest) {
    const corsRes = handleCors(req);
    return corsRes ?? new NextResponse(null, { status: 204 });
}
