export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import { User } from '@/models/User';
import { errorResponse, successResponse } from '@/lib/response';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {

    await connectDB();
    const { userid, username, password, role } = await req.json();

    const existing = await User.findOne({ userid });
    if (existing){
        return errorResponse('이미 존재하는 사용자입니다.', 409);
    }
    //password bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        userid,
        username,
        password : hashedPassword,
        role,
    });

    return successResponse({ message : '회원가입 성공', user : newUser});
}
