import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Hàm kiểm tra quyền
async function checkPermission(userId: string, requiredPermission: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!user) return false;
  
  // ADMIN có tất cả quyền
  if (user.role === 'ADMIN') return true;

  // Kiểm tra quyền của STAFF
  const permissionsKey = `user_permissions_${userId}`;
  const permissionsSetting = await prisma.systemSetting.findUnique({
    where: { key: permissionsKey }
  });
  const permissions = permissionsSetting?.value as string[] || [];
  return permissions.includes(requiredPermission);
}

// GET /api/admin/orders - Lấy danh sách đơn hàng cho admin
export async function GET(request: NextRequest) {
  try {
    // Kiểm tra xác thực và quyền xem đơn hàng
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để xem đơn hàng' },
        { status: 401 }
      );
    }

    // Lấy thông tin user và quyền
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }

    // Kiểm tra quyền xem đơn hàng
    if (currentUser.role !== 'ADMIN') {
      // Nếu là STAFF, kiểm tra quyền 'orders.view'
      const permissionsKey = `user_permissions_${currentUser.id}`;
      const permissionsSetting = await prisma.systemSetting.findUnique({
        where: { key: permissionsKey }
      });
      const permissions = permissionsSetting?.value as string[] || [];
      
      if (!permissions.includes('orders.view')) {
        return NextResponse.json(
          { error: 'Bạn không có quyền xem danh sách đơn hàng' },
          { status: 403 }
        );
      }
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
        { user: { phoneNumber: { contains: search } } }
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.order.count({ where });

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
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
                sku: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Format orders for response
    const formattedOrders = orders.map(order => {
      const totalAmount = Number(order.totalAmount);
      const shippingFee = Number(order.shippingFee);
      const discountAmount = Number(order.discountAmount || 0);
      const finalAmount = totalAmount + shippingFee - discountAmount;

      return {
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
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải danh sách đơn hàng' },
      { status: 500 }
    );
  }
}

// POST /api/admin/orders - Tạo đơn hàng mới (admin tạo thủ công)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }

    // Kiểm tra quyền tạo đơn hàng
    if (currentUser.role !== 'ADMIN') {
      const permissionsKey = `user_permissions_${session.user.id}`;
      const permissionsSetting = await prisma.systemSetting.findUnique({
        where: { key: permissionsKey }
      });
      const permissions = permissionsSetting?.value as string[] || [];
      
      if (!permissions.includes('orders.create')) {
        return NextResponse.json(
          { error: 'Bạn không có quyền tạo đơn hàng' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      userId,
      items,
      shippingAddress,
      paymentMethod,
      notes,
      discountAmount = 0,
      shippingFee = 0
    } = body;

    // Validate required fields
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Thông tin đơn hàng không hợp lệ' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy khách hàng' },
        { status: 404 }
      );
    }

    // Calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json(
          { error: `Không tìm thấy sản phẩm ${item.productId}` },
          { status: 404 }
        );
      }

      const itemTotal = item.quantity * Number(product.price);
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        productName: product.name, // Store product name at time of order
        productSku: product.sku, // Store product SKU at time of order
        quantity: item.quantity,
        price: product.price
      });
    }

    const finalAmount = totalAmount + shippingFee - discountAmount;

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `DH${Date.now()}${(orderCount + 1).toString().padStart(4, '0')}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod || 'COD',
        totalAmount,
        shippingFee,
        discountAmount,
        shippingAddress: shippingAddress || user.address,
        notes,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                sku: true
              }
            }
          }
        }
      }
    });

    // Tính finalAmount cho order trả về
    const orderFinalAmount = Number(order.totalAmount) + Number(order.shippingFee) - Number(order.discountAmount);

    return NextResponse.json({
      success: true,
      data: {
        order: {
          ...order,
          totalAmount: Number(order.totalAmount),
          shippingFee: Number(order.shippingFee),
          discountAmount: Number(order.discountAmount),
          finalAmount: orderFinalAmount
        }
      },
      message: 'Tạo đơn hàng thành công'
    });

  } catch (error) {
    console.error('Error creating admin order:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo đơn hàng' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện thao tác này' },
        { status: 401 }
      );
    }

    // Kiểm tra quyền cập nhật đơn hàng
    const hasPermission = await checkPermission(session.user.id, 'orders.update');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Bạn không có quyền cập nhật đơn hàng' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status, paymentStatus, notes, shippingFee, discountAmount } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'ID đơn hàng không hợp lệ' },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        paymentStatus,
        notes,
        shippingFee,
        discountAmount
      },
      include: {
        user: true,
        orderItems: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder
      },
      message: 'Cập nhật đơn hàng thành công'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật đơn hàng' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện thao tác này' },
        { status: 401 }
      );
    }

    // Kiểm tra quyền xóa đơn hàng
    const hasPermission = await checkPermission(session.user.id, 'orders.delete');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xóa đơn hàng' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'ID đơn hàng không hợp lệ' },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Delete order
    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa đơn hàng thành công'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xóa đơn hàng' },
      { status: 500 }
    );
  }
}
