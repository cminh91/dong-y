import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Tổng đơn hàng
  const totalOrders = await prisma.order.count();
  // Tổng doanh thu
  const revenueAgg = await prisma.order.aggregate({ _sum: { totalAmount: true } });
  const totalRevenue = revenueAgg._sum.totalAmount || 0;
  // Số sản phẩm
  const totalProducts = await prisma.product.count();
  // Số khách hàng
  const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });

  // Đơn hàng gần đây
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: true,
    },
  });

  // Sản phẩm bán chạy (top 4 theo số lượng bán ra)
  const topProductsRaw = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true, price: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 4,
  });
interface TopProductRaw {
    productId: number;
    _sum: {
        quantity: number | null;
        price: number | null;
    };
}

interface TopProduct {
    name: string;
    sales: number;
    revenue: string;
}

const topProducts = await Promise.all(
    topProductsRaw.map(async (item: TopProductRaw): Promise<TopProduct> => {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        return {
            name: product?.name || '',
            sales: item._sum.quantity || 0,
            revenue: item._sum.price ? (item._sum.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0₫',
        };
    })
);

interface Stat {
    title: string;
    value: string | number;
    change: string;
    icon: string;
    color: string;
}

interface RecentOrder {
    id: string;
    customer: string;
    date: string;
    total: string;
    status: string;
}

return NextResponse.json({
    stats: [
        { title: 'Tổng đơn hàng', value: totalOrders, change: '+12%', icon: 'fas fa-shopping-cart', color: 'bg-blue-500' },
        { title: 'Doanh thu', value: totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }), change: '+8%', icon: 'fas fa-money-bill-wave', color: 'bg-green-500' },
        { title: 'Sản phẩm', value: totalProducts, change: '+3', icon: 'fas fa-box', color: 'bg-purple-500' },
        { title: 'Khách hàng', value: totalCustomers, change: '+18', icon: 'fas fa-users', color: 'bg-orange-500' },
    ] as Stat[],
    recentOrders: recentOrders.map((order): RecentOrder => ({
        id: order.orderNumber,
        customer: order.user?.fullName || order.user?.email || '',
        date: order.createdAt.toLocaleDateString('vi-VN'),
        total: order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
        status: order.status,
    })) as RecentOrder[],
    topProducts: topProducts as TopProduct[],
});
}
