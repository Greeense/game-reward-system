export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/response';
import jwt from 'jsonwebtoken';
import { Event } from '@/models/Event';
import { connectDB } from '@/lib/mongo';

export async function GET(req: NextRequest, { params }: any) { //이벤트 상세 조회
    const { id } = params;

    // JWT_SECRET 여부 확인
    const JWT_SECRET = process.env.JWT_SECRET;
    if(!JWT_SECRET){
        return errorResponse('no JWT_SECRET', 500);
    }

    // 요청헤더에서 Authorization 토큰 추출
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');
    if(!authHeader) {
        return errorResponse('Invalid Request',404);
    }

    // Bearer 제거하고 토큰만 추출
    const token = authHeader.replace('Bearer ','');
    if(!token){
        return errorResponse('Invalid Token', 401)
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET) as { userid : string; role: string };

        if(!['admin','operator'].includes(decoded.role)){
            return errorResponse('이벤트 조회 권한이 없습니다.', 403);
        }

        await connectDB();

        const event = await Event.findById(id).lean() as { _id: any, [key: string]: any };
        if (!event || !event._id){
            return errorResponse('Not found Event', 404);
        }

        const { _id, ...rest } = event;

        return successResponse({
            event : {eventId : _id, ...rest }
        });
    }catch (err){
        //검증 실패 : 401
        return errorResponse('Invalid token',401);
    }
}