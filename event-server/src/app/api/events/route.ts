export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/response';
import { requireAuthWithRole } from '@/middleware/auth';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/models/Event';
//이벤트 생성ㄴ
export async function POST(req: NextRequest) {
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
        const decoded = jwt.verify(token, JWT_SECRET) as { userid : string, role: string };

        if(!['admin','operator'].includes(decoded.role)){
            return errorResponse('이벤트 생성 권한이 없습니다.', 403);
        }
        const { title, condition, reward, startDate, endDate } = await req.json();

        await connectDB();

        const newEvent = await Event.create({
            title,
            condition,
            reward,
            startDate,
            endDate,
            createdBy:decoded.userid,
            status : 'upcoming'
        });

        const {_id, ...rest} = newEvent.toObject();

        return successResponse({
            message : '이벤트 생성 성공',
            event : { eventId : _id,  ...rest }
        });
    }catch (err){
        //검증 실패 : 401
        return errorResponse('Invalid token',401);
    }
}
//이벤트 목록 조회
export async function GET(req: NextRequest) {
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
        const decoded = jwt.verify(token, JWT_SECRET) as { userid : string, role: string };

        if(!['admin','operator'].includes(decoded.role)){
            return errorResponse('이벤트 조회 권한이 없습니다.', 403);
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const filter: Record<String, any> = {};
        if(status){
            filter.status = status;
        }

        const events = await Event.find(filter).sort({ startDate: -1}).lean();

        const result = events.map(({ _id, ...rest }) => ({
            eventId : _id,
            ...rest
        }));

        return successResponse({events : result});
    }catch (err){
        //검증 실패 : 401
        return errorResponse('Invalid token',401);
    }
}