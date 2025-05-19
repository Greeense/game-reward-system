//nextJS APP router의 API 헨들러임을 명시하기(nodejs 런타임 지정)
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongo';
import { User } from '@/models/User';
import { errorResponse, successResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
    //mongodb연결
    await connectDB();
    const { userid, password } = await req.json();

    const user = await User.findOne({ userid, password });
    if(!user){
        return errorResponse('Invalid Credentials' ,401);
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

    const token = jwt.sign(
        { userid : user.userid, role : user.role },
        'abcdefghkfg1234567890',
        { expiresIn : '1h'}
    );

    return successResponse({ token });
}