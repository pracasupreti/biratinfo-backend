/* eslint-disable @typescript-eslint/no-explicit-any */
import { createNetwork, getAllNetworks } from "@/actions/network.action";
import { verifyClerkToken } from "@/lib/auth";
import { checkRole } from "@/lib/role";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const header = req.headers.get('Authorization')

        if (!header) throw new Error("Unauthorized")

        await verifyClerkToken(header);
        await checkRole('admin')

        const networks = await getAllNetworks();
        if (!networks) throw new Error("Networks not found or not approved");

        return NextResponse.json({ success: true, data: networks }, { status: 200 });

    } catch (err: any) {

        console.error('Get networks error:', err.message);

        return NextResponse.json(
            { success: false, message: err.message },
            { status: err.statusCode || 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const header = req.headers.get('Authorization')

        if (!header) throw new Error("Unauthorized")

        await verifyClerkToken(header);

        await checkRole('admin')

        const body = await req.json();
        const network = await createNetwork(body);
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

