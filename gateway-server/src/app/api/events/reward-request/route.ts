export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/response';

export async function POST(req: NextRequest){
    const authHeader = req.headers.get('authorization');
    const body = await req.text();

    const response = await fetch(
        `${process.env.EVENT_SERVER_URL}/api/reward-request`,
        {
            method:'POST',
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : authHeader || '',
            },
            body,
        });

    const data = await response.json();
    return NextResponse.json(data, { status : response.status});
}