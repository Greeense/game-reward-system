export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/response';
import { requireAuthWithRole } from '@/middleware/auth';

export async function POST(req: NextRequest) {
    //jwt토큰 없으면 유효하지 않은 요청으로 처리
    const guard = requireAuthWithRole(req);
    if(guard) {
        return guard;
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return errorResponse('Authorization 헤더 없음', 401);
    }

    try{
        const response = await fetch(`${process.env.AUTH_SERVER_URL}/api/editUser`,
            {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : authHeader,
                }
            }
        );
        //auth-server에서 400,500에러 반환 시
        if (!response.ok){
            const errorData = await response.json();
            return errorResponse(
                errorData.message || 'Auth 서버 응답 오류',
                response.status,
                errorData.details || null);
        }

        const data = await response.json();
        return successResponse(data, response.status);
    } catch (err: any) {
         //요청 실패 : auth-server 죽거나 경로없을 시
         return errorResponse('서버 연결 실패 또는 경로 오류', 502, err?.message || err);
    }
}