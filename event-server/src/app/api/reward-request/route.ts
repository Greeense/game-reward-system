export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongo';
import { RewardRequest } from '@/models/RewardRequest';
import { errorResponse, successResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ message: 'No token' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, 'secret') as any;

    const body = await req.json();
    const request = await RewardRequest.create({
      userId: decoded.username,
      eventId: body.eventId,
      status: 'requested',
    });

    return NextResponse.json({ message: 'Reward request created', request });
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized or Error', error }, { status: 401 });
  }
}