import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

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

// GET /api/admin/orders/export - Xuất danh sách đơn hàng ra Excel
export async function GET(request: NextRequest) {
  try {
    // Kiểm tra xác thực và quyền xem đơn hàng
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để xuất dữ liệu' },
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
          { error: 'Bạn không có quyền xuất dữ liệu đơn hàng' },
          { status: 403 }
        );
      }
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
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

    // Get all orders with filters (no pagination for export)
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
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
                name: true,
                sku: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format orders for Excel export
    const formattedOrders = orders.map(order => {
      const totalAmount = Number(order.totalAmount);
      const shippingFee = Number(order.shippingFee);
      const discountAmount = Number(order.discountAmount || 0);
      const finalAmount = totalAmount + shippingFee - discountAmount;

      // Format order items for display
      const orderItemsText = order.orderItems.map(item =>
        `${item.product?.name || 'N/A'} (SKU: ${item.product?.sku || 'N/A'}) - SL: ${item.quantity} - ĐG: ${Number(item.price).toLocaleString('vi-VN')}₫`
      ).join('; ');

      return {
        'Mã đơn hàng': order.orderNumber || order.id,
        'Khách hàng': order.user?.fullName || 'N/A',
        'Email': order.user?.email || 'N/A',
        'Số điện thoại': order.user?.phoneNumber || 'N/A',
        'Địa chỉ': order.shippingAddress || order.user?.address || 'N/A',
        'Ngày đặt': order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A',
        'Trạng thái': getStatusText(order.status),
        'Trạng thái thanh toán': getPaymentStatusText(order.paymentStatus),
        'Phương thức thanh toán': order.paymentMethod || 'N/A',
        'Tổng tiền hàng': totalAmount,
        'Phí vận chuyển': shippingFee,
        'Giảm giá': discountAmount,
        'Tổng thanh toán': finalAmount,
        'Sản phẩm': orderItemsText,
        'Số lượng sản phẩm': order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
        'Ghi chú': order.notes || ''
      };
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedOrders);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đơn hàng');

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Set filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `don-hang-${currentDate}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error exporting orders:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xuất dữ liệu đơn hàng' },
      { status: 500 }
    );
  }
}

// Helper function to get status text in Vietnamese
function getStatusText(status: string): string {
  switch (status) {
    case 'PENDING': return 'Chờ xử lý';
    case 'CONFIRMED': return 'Đã xác nhận';
    case 'PROCESSING': return 'Đang xử lý';
    case 'SHIPPING': return 'Đang giao';
    case 'DELIVERED': return 'Đã giao';
    case 'CANCELLED': return 'Đã hủy';
    default: return status;
  }
}

// Helper function to get payment status text in Vietnamese
function getPaymentStatusText(paymentStatus: string): string {
  switch (paymentStatus) {
    case 'PENDING': return 'Chờ thanh toán';
    case 'PAID': return 'Đã thanh toán';
    case 'FAILED': return 'Thanh toán thất bại';
    case 'REFUNDED': return 'Đã hoàn tiền';
    default: return paymentStatus;
  }
}