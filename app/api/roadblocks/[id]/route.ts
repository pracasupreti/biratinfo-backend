/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { checkRole } from '@/lib/role';
import { handleCors } from '@/lib/cors';
import { deleteRoadBlock, getRoadblockById, updateRoadblock } from '@/actions/roadblock.action';

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

        const data = await getRoadblockById(id);

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

        const roadblock = await updateRoadblock(id, updatedData);
        if (!roadblock.success) throw new Error('Roadblock not found or not approved');

        const res = NextResponse.json({ success: true, data: roadblock }, { status: 201 });

        res.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
        res.headers.set('Vary', 'Origin');

        return res;
    } catch (err: any) {
        console.error('Create roaddblock error:', err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: err.statusCode || 500 }
        );
    }
}

export async function DELETE(
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


        const network = await deleteRoadBlock(id);
        if (!network.success) throw new Error('Roadblock not found or not deleted');

        const res = NextResponse.json({ success: true }, { status: 201 });

        res.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
        res.headers.set('Vary', 'Origin');

        return res;
    } catch (err: any) {
        console.error('Delete roadblock error:', err.message);
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
