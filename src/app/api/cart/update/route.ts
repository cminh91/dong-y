import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

// Verify JWT token
function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
  } catch {
    return null;
  }
}

// PUT - Cập nhật số lượng sản phẩm trong giỏ hàng
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const { cartItemId, quantity } = await request.json();

    if (!cartItemId || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'Thông tin không hợp lệ' },
        { status: 400 }
      );
    }

    // Lấy thông tin cart item và product
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId: user.userId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            stock: true,
            price: true,
            salePrice: true,
            status: true
          }
        }
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng' },
        { status: 404 }
      );
    }

    if (cartItem.product.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Sản phẩm không khả dụng' },
        { status: 400 }
      );
    }

    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        { success: false, message: `Chỉ còn ${cartItem.product.stock} sản phẩm trong kho` },
        { status: 400 }
      );
    }

    // Cập nhật số lượng và giá (cập nhật giá mới nhất)
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
        price: cartItem.product.salePrice || cartItem.product.price
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            price: true,
            salePrice: true,
            stock: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật số lượng ${cartItem.product.name}`,
      data: updatedCartItem
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}