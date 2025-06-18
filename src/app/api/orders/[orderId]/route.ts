import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để xem đơn hàng' },
        { status: 401 }
      );
    }

    // Await params first (Next.js App Router requirement)
    const resolvedParams = await params;
    const { orderId } = resolvedParams;

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID đơn hàng không hợp lệ' },
        { status: 400 }
      );
    }

    // Find order with items
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id // Ensure user can only see their own orders
      },
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
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Parse shipping address from JSON
    const shippingAddress = order.shippingAddress as any;

    // Format response
    const formattedOrder = {
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
        productId: item.productId,
        productName: item.product.name,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.price) * item.quantity
      })),
      latestPayment: order.payments[0] ? {
        id: order.payments[0].id,
        amount: Number(order.payments[0].amount),
        type: order.payments[0].type,
        status: order.payments[0].status,
        externalId: order.payments[0].externalId,
        createdAt: order.payments[0].createdAt.toISOString()
      } : null
    };

    return NextResponse.json({
      success: true,
      order: formattedOrder
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải thông tin đơn hàng' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    // Await params first (Next.js App Router requirement)
    const resolvedParams = await params;
    const { orderId } = resolvedParams;
    const body = await request.json();
    const { status, paymentStatus, notes } = body;

    // Find order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Only allow certain status updates by users
    const allowedStatuses = ['CANCELLED'];
    const allowedPaymentStatuses = [];

    const updateData: any = {};

    if (status && allowedStatuses.includes(status)) {
      updateData.status = status;
    }

    if (paymentStatus && allowedPaymentStatuses.includes(paymentStatus)) {
      updateData.paymentStatus = paymentStatus;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        orderItems: true
      }
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật đơn hàng' },
      { status: 500 }
    );
  }
}