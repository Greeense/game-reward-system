import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { errorResponse, successResponse } from '@/lib/response';


//통합인증 및 권한 체크
export function requireAuthWithRole(req: NextRequest, requiredRole?: string) : Response | undefined {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
    }


    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if(!token) {
        return errorResponse('Invalid Authroization',401);
    }

   try{
       const payload = jwt.verify(token, JWT_SECRET!)  as {role?:string};

       if(requiredRole && payload.role !== requiredRole){
           return errorResponse('접근 권한이 없습니다. ', 403);
       }
        return; //인증 및 권한 통과
   }catch(err){
       return errorResponse('Invalid Token', 401);
   }
}
