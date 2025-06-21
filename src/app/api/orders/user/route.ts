import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để xem đơn hàng' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      userId: session.user.id
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          orderNumber: {
            contains: search
            // mode: 'insensitive' not supported in MySQL/MariaDB
          }
        },
        {
          shippingAddress: {
            path: ['fullName'],
            string_contains: search
          }
        }
      ];
    }

    // Get total count
    const totalCount = await prisma.order.count({ where });

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform orders to match frontend interface
    const transformedOrders = orders.map(order => {
      const shippingAddress = order.shippingAddress as any;
      
      return {
        id: order.id,
        code: order.orderNumber,
        customerName: shippingAddress?.fullName || '',
        customerPhone: shippingAddress?.phoneNumber || '',
        customerEmail: shippingAddress?.email || '',
        shippingAddress: shippingAddress?.address || '',
        notes: order.notes || '',
        subtotal: Number(order.totalAmount) - Number(order.shippingFee),
        shippingFee: Number(order.shippingFee),
        totalAmount: Number(order.totalAmount),
        paymentMethod: order.paymentMethod,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.orderItems.map(item => ({
          id: item.id,
          productName: item.product.name,
          price: Number(item.price),
          quantity: item.quantity,
          subtotal: Number(item.price) * item.quantity
        }))
      };
    });

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải danh sách đơn hàng' },
      { status: 500 }
    );
  }
}
