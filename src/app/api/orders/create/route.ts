import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const createOrderSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  phoneNumber: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  notes: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    productId: z.string().optional(), // For cart items that have productId
    name: z.string(),
    price: z.number(),
    quantity: z.number().min(1),
    image: z.string().optional()
  })),
  totalAmount: z.number().min(0),
  shippingFee: z.number().min(0),
  paymentMethod: z.enum(['COD', 'MOMO', 'BANK_TRANSFER', 'CREDIT_CARD']),
  // Affiliate tracking
  affiliateSlug: z.string().optional(),
  referralCode: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để đặt hàng' },
        { status: 401 }
      );
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, fullName: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Creating order for user:', user.id);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Find affiliate link if provided
    let affiliateLink = null;
    let affiliateUser = null;
    if (validatedData.affiliateSlug) {
      affiliateLink = await prisma.affiliateLink.findUnique({
        where: { slug: validatedData.affiliateSlug },
        include: {
          user: {
            select: {
              id: true,
              role: true,
              commissionRate: true,
              referralCode: true
            }
          }
        }
      });

      if (affiliateLink && affiliateLink.status === 'ACTIVE') {
        affiliateUser = affiliateLink.user;
        console.log('Affiliate tracking found:', {
          linkSlug: affiliateLink.slug,
          userId: affiliateUser.id,
          commissionRate: affiliateUser.commissionRate
        });
      }
    }

    // Validate that all items have valid productIds
    const productIds = validatedData.items.map(item => item.productId || item.id);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, salePrice: true, stock: true, status: true }
    });

    if (existingProducts.length !== productIds.length) {
      const missingIds = productIds.filter(id => !existingProducts.find(p => p.id === id));
      return NextResponse.json(
        { error: `Sản phẩm không tồn tại: ${missingIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate stock and status
    for (const item of validatedData.items) {
      const productId = item.productId || item.id;
      const product = existingProducts.find(p => p.id === productId);

      if (!product) continue;

      if (product.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: `Sản phẩm ${product.name} không khả dụng` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Sản phẩm ${product.name} chỉ còn ${product.stock} trong kho` },
          { status: 400 }
        );
      }
    }

    // Calculate total
    const calculatedSubtotal = validatedData.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    const calculatedTotal = calculatedSubtotal + validatedData.shippingFee;

    // Verify amounts match
    if (Math.abs(calculatedSubtotal - validatedData.totalAmount) > 1) {
      return NextResponse.json(
        { error: 'Tổng tiền không khớp' },
        { status: 400 }
      );
    }

    // Generate order code
    const orderCode = `DH${Date.now()}`;

    // Create order in database with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Final check for product availability within transaction
      const productIds = validatedData.items.map(item => item.productId || item.id);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          status: 'ACTIVE'
        },
        select: { id: true, name: true, stock: true }
      });

      // Verify all products still exist and have stock
      for (const item of validatedData.items) {
        const productId = item.productId || item.id;
        const product = products.find(p => p.id === productId);

        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
      }

      // Debug: Log order creation data
      const orderItemsData = validatedData.items.map(item => {
        const productId = item.productId || item.id;
        console.log(`Preparing order item: productId=${productId}, price=${item.price}, quantity=${item.quantity}`);
        return {
          productId: productId,
          price: item.price,
          quantity: item.quantity
        };
      });

      console.log('Creating order with data:', {
        orderNumber: orderCode,
        userId: session.user.id,
        orderItemsCount: orderItemsData.length
      });

      // Create order first (without order items)
      const newOrder = await tx.order.create({
        data: {
          orderNumber: orderCode,
          userId: session.user.id,
          shippingAddress: {
            fullName: validatedData.fullName,
            phoneNumber: validatedData.phoneNumber,
            email: validatedData.email,
            address: validatedData.address
          },
          notes: validatedData.notes || '',
          shippingFee: validatedData.shippingFee,
          totalAmount: calculatedTotal,
          paymentMethod: validatedData.paymentMethod,
          status: 'PENDING',
          paymentStatus: validatedData.paymentMethod === 'COD' ? 'PENDING' : 'PENDING'
        }
      });

      console.log('Order created successfully:', newOrder.id);

      // Create order items separately
      const createdOrderItems = [];
      for (const itemData of orderItemsData) {
        console.log(`Creating order item for order ${newOrder.id}:`, itemData);
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            ...itemData
          },
          include: {
            product: true
          }
        });
        createdOrderItems.push(orderItem);
        console.log('Order item created:', orderItem.id);
      }

      // Return order with items
      const orderWithItems = {
        ...newOrder,
        orderItems: createdOrderItems
      };

      // Update product stock
      for (const item of validatedData.items) {
        await tx.product.update({
          where: { id: item.productId || item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Create affiliate commission if applicable
      if (affiliateLink && affiliateUser && affiliateUser.commissionRate > 0) {
        // Get commission settings
        const commissionSettings = await tx.systemSetting.findUnique({
          where: { key: 'commission_first_order_only' }
        });

        const firstOrderOnly = commissionSettings?.value === true || commissionSettings?.value === 'true';
        let isEligibleForCommission = true;

        if (firstOrderOnly) {
          // Check if this is customer's first order
          const existingOrders = await tx.order.count({
            where: {
              userId: session.user.id,
              status: {
                in: ['CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED']
              }
            }
          });

          isEligibleForCommission = existingOrders === 0;
        }

        if (isEligibleForCommission) {
          const commissionAmount = calculatedTotal * (affiliateUser.commissionRate / 100);

          console.log('Creating commission:', {
            orderId: newOrder.id,
            userId: affiliateUser.id,
            referredUserId: session.user.id,
            amount: commissionAmount,
            userCommissionRate: affiliateUser.commissionRate,
            firstOrderOnly,
            isEligible: isEligibleForCommission
          });

          await tx.commission.create({
            data: {
              userId: affiliateUser.id, // Affiliate user
              orderId: newOrder.id,
              referredUserId: session.user.id, // User who made the order
              level: 1, // Direct referral
              orderAmount: calculatedTotal,
              commissionRate: affiliateUser.commissionRate / 100, // Convert to decimal
              amount: commissionAmount,
              status: 'PENDING' // Will be paid when order is completed
            }
          });
        } else {
          console.log('No commission - not eligible:', {
            customerId: session.user.id,
            affiliateUserId: affiliateUser.id,
            firstOrderOnly,
            reason: firstOrderOnly ? 'Customer has previous orders' : 'Commission settings'
          });
        }

        // Update affiliate link stats
        await tx.affiliateLink.update({
          where: { id: affiliateLink.id },
          data: {
            totalConversions: { increment: 1 },
            totalCommission: { increment: commissionAmount },
            lastConversionAt: new Date()
          }
        });

        // Update user affiliate stats
        await tx.user.update({
          where: { id: affiliateUser.id },
          data: {
            totalSales: { increment: calculatedTotal },
            totalCommission: { increment: commissionAmount }
          }
        });

        console.log('✅ Commission created successfully');
      }

      return orderWithItems;
    });

    // If COD, mark as confirmed
    if (validatedData.paymentMethod === 'COD') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' }
      });
    }

    // Clear user's cart after successful order
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id }
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderCode: order.orderNumber,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod
    });

  } catch (error) {
    console.error('Order creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    // Handle specific business logic errors
    if (error instanceof Error) {
      if (error.message.includes('Product not found')) {
        return NextResponse.json(
          { error: 'Một số sản phẩm không còn tồn tại' },
          { status: 400 }
        );
      }

      if (error.message.includes('Insufficient stock')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo đơn hàng' },
      { status: 500 }
    );
  }
}