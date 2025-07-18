import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for order status update
const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  notes: z.string().optional(),
  adminNote: z.string().optional(),
  trackingNumber: z.string().optional()
});

// GET /api/admin/orders/[id] - Lấy chi tiết đơn hàng
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Kiểm tra xác thực
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    // Kiểm tra quyền xem đơn hàng
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }

    // Kiểm tra quyền
    if (user.role !== 'ADMIN') {
      const permissionsKey = `user_permissions_${session.user.id}`;
      const permissionsSetting = await prisma.systemSetting.findUnique({
        where: { key: permissionsKey }
      });
      const permissions = permissionsSetting?.value as string[] || [];
      
      if (!permissions.includes('orders.view')) {
        return NextResponse.json(
          { error: 'Bạn không có quyền xem đơn hàng này' },
          { status: 403 }
        );
      }
    }

    const { id } = await params;

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            address: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                sku: true,
                stock: true
              }
            }
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            type: true,
            status: true,
            externalId: true,
            paidAt: true,
            createdAt: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Format order for response
    const totalAmount = Number(order.totalAmount);
    const shippingFee = Number(order.shippingFee);
    const discountAmount = Number(order.discountAmount || 0);
    const finalAmount = totalAmount + shippingFee - discountAmount;

    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      user: order.user,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount,
      shippingFee,
      discountAmount,
      finalAmount,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: Number(item.price),
        total: item.quantity * Number(item.price)
      })),
      itemCount: order.orderItems.length,
      totalQuantity: order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    };

    return NextResponse.json({
      success: true,
      data: { order: formattedOrder }
    });

  } catch (error) {
    console.error('Error fetching admin order:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải đơn hàng' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/orders/[id] - Cập nhật đơn hàng
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }

    // Kiểm tra quyền
    if (user.role !== 'ADMIN') {
      const permissionsKey = `user_permissions_${session.user.id}`;
      console.log('Checking permissions for user:', session.user.id);
      console.log('Permission key:', permissionsKey);

      const permissionsSetting = await prisma.systemSetting.findUnique({
        where: { key: permissionsKey }
      });
      console.log('Permission setting:', permissionsSetting);

      if (!permissionsSetting) {
        console.log('No permissions found for user');
        return NextResponse.json(
          { error: 'Bạn không có quyền cập nhật đơn hàng' },
          { status: 403 }
        );
      }

      const permissions = permissionsSetting.value as string[];
      console.log('User permissions:', permissions);
      
      if (!permissions.includes('orders.edit')) {
        console.log('Missing required permission: orders.edit');
        return NextResponse.json(
          { error: 'Bạn không có quyền cập nhật đơn hàng' },
          { status: 403 }
        );
      }
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;
      
      // Handle stock updates based on status change
      if (validatedData.status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
        // Return stock when order is cancelled
        for (const item of existingOrder.orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }
      }
    }

    if (validatedData.paymentStatus) {
      updateData.paymentStatus = validatedData.paymentStatus;
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    if (validatedData.trackingNumber !== undefined) {
      updateData.trackingNumber = validatedData.trackingNumber;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            address: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                sku: true,
                stock: true
              }
            }
          }
        }
      }
    });

    // Tính toán các giá trị
    const totalAmount = Number(updatedOrder.totalAmount);
    const shippingFee = Number(updatedOrder.shippingFee);
    const discountAmount = Number(updatedOrder.discountAmount || 0);

    // Format response để trả về cùng cấu trúc với GET
    const formattedOrder = {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      user: updatedOrder.user,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      paymentMethod: updatedOrder.paymentMethod,
      totalAmount,
      shippingFee,
      discountAmount,
      finalAmount: totalAmount + shippingFee - discountAmount,
      shippingAddress: updatedOrder.shippingAddress,
      notes: updatedOrder.notes,
      trackingNumber: updatedOrder.trackingNumber,
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
      orderItems: updatedOrder.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: Number(item.price),
        total: item.quantity * Number(item.price)
      })),
      itemCount: updatedOrder.orderItems.length,
      totalQuantity: updatedOrder.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    };

    // Log the status change
    console.log(`User ${session.user.id} updated order ${id}:`, validatedData);

    return NextResponse.json({
      success: true,
      data: { order: formattedOrder },
      message: 'Cập nhật đơn hàng thành công'
    });

  } catch (error) {
    console.error('Error updating admin order:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật đơn hàng' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/orders/[id] - Xóa đơn hàng
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bạn không có quyền xóa đơn hàng' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if order exists and can be deleted
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Only allow deletion of cancelled orders or pending orders
    if (!['CANCELLED', 'PENDING'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Chỉ có thể xóa đơn hàng đã hủy hoặc đang chờ xử lý' },
        { status: 400 }
      );
    }

    // Delete order (cascade will delete order items)
    await prisma.order.delete({
      where: { id }
    });

    // If order was not cancelled, return stock
    if (order.status === 'PENDING') {
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa đơn hàng thành công'
    });

  } catch (error) {
    console.error('Error deleting admin order:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xóa đơn hàng' },
      { status: 500 }
    );
  }
}
