import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// Standard API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Success response helper
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({
    success: true,
    data
  }, { status });
}

// Error response helper
export function errorResponse(error: string, status: number = 400): NextResponse {
  return NextResponse.json({
    success: false,
    error
  }, { status });
}

// Validation error response helper
export function validationErrorResponse(errors: Record<string, string[]>): NextResponse {
  return NextResponse.json({
    success: false,
    error: 'Dữ liệu không hợp lệ',
    errors
  }, { status: 422 });
}

// Handle Zod validation errors
export function handleZodError(error: ZodError): NextResponse {
  const errors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return validationErrorResponse(errors);
}

// Handle Prisma errors
export function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
  switch (error.code) {
    case 'P2002':
      return errorResponse('Dữ liệu đã tồn tại', 409);
    case 'P2025':
      return errorResponse('Không tìm thấy dữ liệu', 404);
    case 'P2003':
      return errorResponse('Vi phạm ràng buộc khóa ngoại', 400);
    case 'P2014':
      return errorResponse('Dữ liệu không hợp lệ', 400);
    default:
      console.error('Prisma error:', error);
      return errorResponse('Lỗi cơ sở dữ liệu', 500);
  }
}

// Generic error handler
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 500);
  }

  return errorResponse('Đã xảy ra lỗi không xác định', 500);
}

// Not found response
export function notFoundResponse(message: string = 'Không tìm thấy'): NextResponse {
  return errorResponse(message, 404);
}

// Unauthorized response
export function unauthorizedResponse(message: string = 'Không có quyền truy cập'): NextResponse {
  return errorResponse(message, 401);
}

// Forbidden response
export function forbiddenResponse(message: string = 'Bị cấm truy cập'): NextResponse {
  return errorResponse(message, 403);
}