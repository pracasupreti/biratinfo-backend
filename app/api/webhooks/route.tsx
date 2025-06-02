/* eslint-disable @typescript-eslint/no-explicit-any */
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { handleUserCreated, handleUserDeleted, handleUserUpdated } from '@/actions/user.action';

export async function POST(req: Request) {
    console.log('Webhook received!');
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('CLERK_WEBHOOK_SECRET is missing')
    }

    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occurred -- no svix headers', {
            status: 400
        })
    }

    const payload = await req.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(WEBHOOK_SECRET)
    let evt: any

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as any
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occurred', {
            status: 400
        })
    }

    const { type, data } = evt

    try {
        switch (type) {
            case 'user.created':
                await handleUserCreated(data)
                break
            case 'user.updated':
                await handleUserUpdated(data)
                break
            case 'user.deleted':
                await handleUserDeleted(data)
                break
            case 'role.updated':
                await handleUserUpdated(data)
                break
            default:
                console.log(`Unhandled event type: ${type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Error handling webhook event:', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}