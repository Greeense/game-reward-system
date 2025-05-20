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

        const {eventId } = await req.json();
        if (!eventId) {
                  return errorResponse('이벤트 ID가 없습니다.', 400);
                }
        const userId = decoded.userid;

        //1. 중복 요청 방지
        const exist = await RewardRequest.findOne({ userId, eventId});
        if(exist){
            return errorResponse('이미 보상을 요청했거나 요청 중 입니다', 409);
        }

        //2. 보상 정보 확인
        const reward = await Reward.findOne({ eventId  });
        if(!reward){
            return errorResponse('해당 이벤트에 대한 보상이 존재하지 않습니다.', 404);
        }

        //3. 유저 진행상황 확인
        const progress = await UserEventProgress.findOne({ userId, eventId });
        const isEligible = progress?.isCompleted === true;

        //4. 자동 처리 결과 작성
        const status = isEligible ? 'approved' : 'rejected';

        const rewardRequest = await RewardRequest.create({
            userId,
            eventId,
            reward : {
                type : reward.type,
                value : reward.value
            },
            status,
            requestedAt : new Date(),
            handledBy : 'system',
            handledAt : new Date()
        });

        if(!isEligible){
            return errorResponse('조건을 만족하지 않아 보상이 지급되지 않았습니다.', 400);
        }

        return successResponse({
            message : '보상이 자동으로 승인 및 지급되었습니다.',
            rewardRequest
        });
    }catch (err){
        //검증 실패 : 401
        return errorResponse('Invalid token',401);
    }
}