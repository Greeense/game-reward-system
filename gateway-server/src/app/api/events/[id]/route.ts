export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/response';
import { requireAuthWithRole } from '@/middleware/auth';

export async function GET(
                        req: NextRequest,
                        { params }: { params: { id: string } }
                      ) {
    //jwt토큰 없으면 유효하지 않은 요청으로 처리
    const guard = requireAuthWithRole(req);
    if(guard) {
        return guard;
    }
    //헤더 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return errorResponse('Authorization 헤더 없음', 401);
    }

    const EVENT_SERVER_URL = process.env.EVENT_SERVER_URL;
    if(!EVENT_SERVER_URL){
        return errorResponse('환경변수 EVENT_SERVER_URL  누락',500);
    }

    try{
        const res = await fetch(`${EVENT_SERVER_URL}/api/events/${params.id}`, {
             method: 'GET',
              Authorization: authHeader
            }
        });

        const data = await res.json();
        return new Response(JSON.stringify(data), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
          //요청 실패 : event-server 죽거나 경로없을 시
         return errorResponse('서버 연결 실패 또는 경로 오류', 502, err?.message || err);
    }
}