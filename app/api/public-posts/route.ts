// app/api/posts/route.ts
import { submitPublicPost } from '@/actions/publicPost.action';
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
    console.log("POST ROUTE HIT")
    try {
        const body = await req.json();
        const result = await submitPublicPost(body, req.headers);
        console.log(result)

        return NextResponse.json(result, {
            status: result.success ? 201 : 400,
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

