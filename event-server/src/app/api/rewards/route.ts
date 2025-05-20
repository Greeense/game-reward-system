export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/response';
import jwt from 'jsonwebtoken';
import { Event } from '@/models/Event';
import { Reward } from '@/models/Reward';
import { connectDB } from '@/lib/mongo';
import mongoose from 'mongoose';
//보상 등록
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
            return errorResponse('보상 등록 권한이 없습니다.', 403);
        }

        const {eventId, type, value, description }  = await req.json();

        await connectDB();

        const reward = await Reward.create({
            eventId,
            type,
            value,
            description,
            createdBy : decoded.userid
        });

        return successResponse({
            message : '보상 등록 성공',
            reward
        });
    }catch (err){
        //검증 실패 : 401
        return errorResponse('Invalid token',401);
    }
}

//보상 조회
export async function GET(req : NextRequest){
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
            return errorResponse('보상 조회 권한이 없습니다.', 403);
        }

        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get('eventId');

        await connectDB();

        const filter : Record<string, any> = {};
        if (eventId) {
            try {
                filter.eventId = new mongoose.Types.ObjectId(eventId);
            } catch (e) {
                return errorResponse('잘못된 eventId 형식입니다.', 400);
            }
        }

        const rewards = await Reward.find(filter).sort({ createdAt : -1}).lean();

        return successResponse({
            message : '보상 조회 성공',
            rewards
        });
    }catch (err){
        //검증 실패 : 401
        return errorResponse('Invalid token',401);
    }
}