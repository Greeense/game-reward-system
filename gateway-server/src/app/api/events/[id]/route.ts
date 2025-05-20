export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/response';
import { requireAuthWithRole } from '@/middleware/auth';

export async function GET(  req: NextRequest,context: any) {
  const { id } = context.params;
  // 1. 인증 체크
  // JWT_SECRET 여부 확인
  const guard = requireAuthWithRole(req);
  if(guard) {
      return guard;
  }

  // 2. Authorization 헤더 확인
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse('Authorization 헤더 없음', 401);
  }

  // 3. 이벤트 서버 주소 확인
  const EVENT_SERVER_URL = process.env.EVENT_SERVER_URL;
  if (!EVENT_SERVER_URL) {
    return errorResponse('환경변수 EVENT_SERVER_URL 누락', 500);
  }

  try {
    // 4. 내부 API 요청
    const response = await fetch(`${EVENT_SERVER_URL}/api/events/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return errorResponse('서버 연결 실패 또는 경로 오류', 502, err?.message || String(err));
  }
}