export const runtime = 'nodejs';

import  { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { errorResponse, successResponse } from '@/lib/response';

export async function POST(req: NextRequest){
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
    try{
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        //검증 성공
        return successResponse({
          message: '토큰 내용',
          user: decoded,
        });
    }catch (err){
        //검증 실패 : 401
        return errorResponse('Invalid token',401);
    }
}