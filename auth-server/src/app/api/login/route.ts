//nextJS APP router의 API 헨들러임을 명시하기(nodejs 런타임 지정)
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongo';
import { User } from '@/models/User';
import { errorResponse, successResponse } from '@/lib/response';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
    //mongodb연결
    await connectDB();
    const { userid, password } = await req.json();
    // 1. 로그인 확인 : password 비교
    const user = await User.findOne({ userid }).select('+password');
    if(!user){
        return errorResponse('Not found User' ,404);
    }
    // 2. 로그인 확인 : password 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return errorResponse('Invalid Credentials', 401);
    }

    const now = new Date();

    //출석일 계산
    const lastLogin = user.lastLoginDate;
    const diffDays = lastLogin
       ? Math.floor((now.getTime() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24))
       : null;

    if(diffDays === 1){
        user.consecutiveLoginCount +=1; //하루차이면 연속 로그인
    }else if( diffDays === 0){
        //같은 날 재로그인 시 카운트 변화 x
    }else{
        //연속 끊김
        user.consecutiveLoginCount = 1;
    }

    user.loginCount += 1;
    user.lastLoginDate = now;

    await user.save();
    // 토큰 발급
    const token = jwt.sign(
        { userid : user.userid, role : user.role },
        `${process.env.JWT_SECRET}`,
        { expiresIn : '1h'}
    );

    return successResponse({ token });
}