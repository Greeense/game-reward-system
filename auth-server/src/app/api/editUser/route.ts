export const runtime = 'nodejs';

import  { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { errorResponse, successResponse } from '@/lib/response';
import { connectDB } from '@/lib/mongo';
import { User } from '@/models/User';
import bcrypt from 'bcrypt';

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
    if(!token){
        return errorResponse('Not found Token', 401)
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET) as { userid : string, role: string };

        const {targetUserid, username, password, role } = await req.json();
        const target = targetUserid || decoded.userid;

        //DB 연결
        await connectDB();
        //본인 정부 수정 가능
        if(decoded.role !== 'admin' && decoded.userid != target){
            return errorResponse('본인만 수정할 수 있습니다.', 403);
        }
        //role 수정 금지
        if(decoded.role !== 'admin' && typeof role != 'undefined'){
            return errorResponse('권한은 수정할 수 없습니다.', 403);
        }

        //수정 로직
        const updateFields: Record<string, any> = {};
        if(username){ //이름 수정
            updateFields.username = username;
        }
        if(password){ // password 수정
            updateFields.password = await bcrypt.hash(password, 10);
        }
        //관리자는 role도 수정 가능
        if(decoded.role === 'admin' && role){
            updateFields.role = role;
        }

        const updated = await User.findOneAndUpdate(
            { userid : target },
            updateFields,
            { new: true, lean: true }
        ).select('-password').lean();

        if(!updated){
            return errorResponse('Not found User', 404);
        }

        return successResponse({
            message : '유저 정보 수정 성공',
            user: updated,
        });
    }catch (err){
        //검증 실패 : 401
        return errorResponse('Invalid token',401);
    }
}