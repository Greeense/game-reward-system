export const runtime = 'nodejs';

import  { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { errorResponse, successResponse } from '@/lib/response';
import { connectDB } from '@/lib/mongo';
import { User } from '@/models/User';


export async function POST(req: NextRequest){
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

    try{
        const decoded = jwt.verify(token, JWT_SECRET) as { userid : string, role: string };
        //DB에서 사용자 조회
        await connectDB();

        const user = await User.findOne({ userid : decoded.userid }).select('-password').lean();
        if(!user) {
            //notfound user
            return errorResponse('User not found', 404);
        }
        return successResponse({
            message : '내 정보 조회 성공',
            user : user,
        });

    }catch (err){
        //검증 실패 : 401
        return errorResponse('Invalid token',401);
    }
}