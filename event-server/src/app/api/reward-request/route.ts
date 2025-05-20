export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongo';
import { RewardRequest } from '@/models/RewardRequest';
import { errorResponse, successResponse } from '@/lib/response';

// 유저 보상 요청 조회
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

        await connectDB();

        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get('eventId');
        const status = searchParams.get('status');
        const filterUserId = searchParams.get('userId');

        const query: Record<string, any> = {};

        if(eventId) {
            query.eventId = eventId;
        }
        if(status) {
            query.stats = status;
        }
        // 일반 유저는 본인것만 조회, 나머지 역할은 유저 전체 조회 가능
        if(['admin','operator','auditor'].includes(decoded.role)){
            if(filterUserId){
                query.userId = fileterUserId;
            }
        }else{
            query.userId = decoded.userid;
        }

        const results = await RewardRequest.find(query).sort({ requestedAt: -1}).lean();

        return successResponse({
            message : '보상 요청 조회 성공',
            requests : result
        });


    }catch (err){
        //검증 실패 : 401
        return errorResponse('Invalid token',401);
    }
}