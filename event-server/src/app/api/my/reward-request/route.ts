export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongo';
import { RewardRequest } from '@/models/RewardRequest';
import { UserEventProgress } from '@/models/UserEventProgress';
import { Reward } from '@/models/Reward';
import { errorResponse, successResponse } from '@/lib/response';

// 유저의 이벤트 보상 지급 요청
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

        if(decoded.role !== 'user'){
            return errorResponse('보상 요청 권한은 user만 가능합니다.', 403);
        }

        await connectDB();

        // 1. 유저의 이벤트 조건 달성 여부 확인
        const progress = await UserEventProgress.findOne({ userId, eventId });
        if(!progress || !progress.isCompleted){
            return errorResponse('아직 이벤트 조건을 달성하지 않았습니다.', 400);
        }
        // 2. 유저의 중복 보상 요청 방지
        const existRequest = await RewardRequest.findOne({ userId, eventId });
        if(existRequest) {
            return errorResponse('이미 보상을 요청했거나 요청 중 입니다', 409);
        }
        // 3. 보상 정보 불러오기
        const reward = await Reward.findOne({eventId});
        if(!reward){
            return errorResponse('해당 이벤트에 대한 보상이 존재하지 않습니다.', 404);
        }
        //4. 보상 요청 등록
        const rewardRequest = await RewardRequest.create({
            userId,
            eventId,
            reward : {
                type : reward.type,
                value : reward.value
            },
            status : 'pending',
            requestedAt: new Date()
        });

        return successResponse({
            message : '보상 요청이 접수되었습니다.',
            requestedId : rewardRequest._id
        });
    }catch (err){
        //검증 실패 : 401
        return errorResponse('Invalid token',401);
    }
}