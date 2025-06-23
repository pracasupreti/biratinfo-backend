/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyClerkToken } from '@/lib/auth';
import { getNetworkById, updateNetwork } from '@/actions/network.action';
import { checkRole } from '@/lib/role';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Token verification (throws if invalid)
        const header = req.headers.get('Authorization')
        if (!header) throw new Error("Unauthorized")
        await verifyClerkToken(header);

        const { id } = await params;
        if (!id) throw new Error("Id is required")

        const data = await getNetworkById(id);
        return NextResponse.json({ success: true, data }, { status: 200 });

    } catch (err: any) {
        console.error('Status route error:', err.message);
        return NextResponse.json({ success: false, message: err.message }, {
            status: err.message.includes('token') ? 401 : 500
        });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) throw new Error("Id is required")
        const header = req.headers.get('Authorization')

        if (!header) throw new Error("Unauthorized")

        await verifyClerkToken(header);

        await checkRole('admin')

        const updatedData = await req.json();
        if (!updatedData) throw new Error("Body parameters are required")


        const network = await updateNetwork(id, updatedData);
        if (!network.success) throw new Error("Networks not found or not approved");

        return NextResponse.json({ success: true, data: network }, { status: 201 });

    } catch (err: any) {
        console.error('Create network error:', err.message);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: err.statusCode || 500 }
        );
    }
}