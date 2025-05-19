import { NextResponse } from 'next/server';

export function errorResponse(
  message: string,
  status: number = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(typeof details === 'object' && details !== null ? { details } : {})
    },
    { status }
  );
}

export function successResponse(
  data: unknown,
  status: number = 200,
  message: string = '요청이 성공적으로 처리되었습니다.'
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}