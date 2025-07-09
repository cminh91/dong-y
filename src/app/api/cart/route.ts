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

// GET - Lấy giỏ hàng của user
export async function GET() {
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

    // Lấy giỏ hàng từ database
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            price: true,
            salePrice: true,
            stock: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Tính tổng tiền
    const total = cartItems.reduce((sum, item) => {
      const itemPrice = item.product.salePrice || item.product.price;
      return sum + (Number(itemPrice) * item.quantity);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        items: cartItems,
        total,
        count: cartItems.length
      }
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}

// POST - Thêm sản phẩm vào giỏ hàng
export async function POST(request: NextRequest) {
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

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin sản phẩm' },
        { status: 400 }
      );
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        stock: true,
        status: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Sản phẩm không khả dụng' },
        { status: 400 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, message: `Chỉ còn ${product.stock} sản phẩm trong kho` },
        { status: 400 }
      );
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.userId,
          productId: product.id
        }
      }
    });

    let cartItem;
    if (existingCartItem) {
      // Cập nhật số lượng nếu sản phẩm đã có trong giỏ
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { success: false, message: `Số lượng vượt quá tồn kho. Chỉ còn ${product.stock} sản phẩm` },
          { status: 400 }
        );
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: newQuantity,
          price: product.salePrice || product.price // Cập nhật giá mới nhất
        }
      });
    } else {
      // Tạo mới cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.userId,
          productId: product.id,
          quantity,
          price: product.salePrice || product.price
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Đã thêm ${product.name} vào giỏ hàng`,
      data: {
        cartItemId: cartItem.id,
        productId: product.id,
        productName: product.name,
        quantity: cartItem.quantity,
        price: cartItem.price
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa sản phẩm khỏi giỏ hàng
export async function DELETE(request: NextRequest) {
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

    const { productId, cartItemId } = await request.json();

    if (!productId && !cartItemId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin sản phẩm' },
        { status: 400 }
      );
    }

    // Xóa theo cartItemId hoặc productId
    let whereCondition;
    if (cartItemId) {
      whereCondition = {
        id: cartItemId,
        userId: user.userId // Đảm bảo chỉ xóa cart item của user hiện tại
      };
    } else {
      whereCondition = {
        userId_productId: {
          userId: user.userId,
          productId: productId
        }
      };
    }

    const deletedItem = await prisma.cartItem.delete({
      where: whereCondition,
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${deletedItem.product.name} khỏi giỏ hàng`,
      data: {
        deletedItemId: deletedItem.id
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  }
}