'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { OrderStatus, PaymentStatus } from '@prisma/client'

export async function getOrders() {
  await requireAdmin()

  return prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true
        }
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getOrderById(id: string) {
  await requireAdmin()

  return prisma.order.findUnique({
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
              sku: true
            }
          }
        }
      }
    }
  })
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin()

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    revalidatePath('/admin/orders')
  } catch (error) {
    throw new Error('Không thể cập nhật trạng thái đơn hàng')
  }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  await requireAdmin()

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus }
    })

    revalidatePath('/admin/orders')
  } catch (error) {
    throw new Error('Không thể cập nhật trạng thái thanh toán')
  }
}

export async function getOrderStats() {
  await requireAdmin()

  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    monthlyRevenue
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { status: 'CANCELLED' } }),
    prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { totalAmount: true }
    }),
    prisma.order.aggregate({
      where: {
        status: 'DELIVERED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { totalAmount: true }
    })
  ])

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    monthlyRevenue: monthlyRevenue._sum.totalAmount || 0
  }
}
