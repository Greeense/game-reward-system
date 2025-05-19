export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const response = await fetch(`${process.env.AUTH_SERVER_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    //auth-server에서 400,500에러 반환 시
    if (!response.ok){
        const errorData = await response.json();
        return errorResponse('Auth 서버 응답 오류', response.status, errorData);
    }

    const data = await response.json();
    return successResponse(data, response.status);

  } catch (err: any) {
    return errorResponse('서버 연결 실패 또는 경로 오류', 502, err?.message || err);
  }
}