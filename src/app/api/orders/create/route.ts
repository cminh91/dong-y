import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Multi-level commission helper function
async function createMultiLevelCommissions(tx: any, params: {
  affiliateUserId: string;
  orderId: string;
  orderItemId: string;
  productId: string;
  referredUserId: string;
  itemTotal: any;
  baseCommissionAmount: any;
}) {
  const { affiliateUserId, orderId, orderItemId, productId, referredUserId, itemTotal, baseCommissionAmount } = params;

  // Get commission level settings
  const levelSettings = await tx.commissionLevelSetting.findMany({
    where: { isActive: true },
    orderBy: { level: 'asc' }
  });

  if (levelSettings.length === 0) return;

  // Find upline users
  let currentUserId = affiliateUserId;
  let level = 1;

  for (const levelSetting of levelSettings) {
    // Find the user who referred current user
    const uplineUser = await tx.user.findFirst({
      where: {
        referredUsers: {
          some: { id: currentUserId }
        }
      },
      select: {
        id: true,
        fullName: true,
        affiliateLevel: true
      }
    });

    if (!uplineUser) break; // No more upline

    // Calculate level commission (percentage of base commission)
    const levelCommissionAmount = baseCommissionAmount * levelSetting.commissionRate;

    console.log('Creating level commission:', {
      level: levelSetting.level,
      uplineUser: uplineUser.fullName,
      uplineUserId: uplineUser.id,
      levelRate: Number(levelSetting.commissionRate),
      baseCommission: Number(baseCommissionAmount),
      levelCommission: Number(levelCommissionAmount)
    });

    // Create level commission
    await tx.commission.create({
      data: {
        userId: uplineUser.id,
        orderId: orderId,
        orderItemId: orderItemId,
        productId: productId,
        referredUserId: referredUserId,
        level: levelSetting.level + 1, // Level 2, 3, etc.
        commissionType: 'LEVEL',
        orderAmount: itemTotal,
        commissionRate: levelSetting.commissionRate,
        amount: levelCommissionAmount,
        status: 'PENDING'
      }
    });

    // Update upline user stats
    await tx.user.update({
      where: { id: uplineUser.id },
      data: {
        totalCommission: { increment: levelCommissionAmount }
      }
    });

    // Move to next level
    currentUserId = uplineUser.id;
    level++;
  }
}

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

    // DEBUG: Log affiliate tracking data
    console.log('=== AFFILIATE TRACKING DEBUG ===');
    console.log('Request body affiliateSlug:', body.affiliateSlug);
    console.log('Validated affiliateSlug:', validatedData.affiliateSlug);
    console.log('Request body referralCode:', body.referralCode);

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
        console.log('✅ Affiliate tracking found:', {
          linkSlug: affiliateLink.slug,
          userId: affiliateUser.id,
          commissionRate: affiliateUser.commissionRate
        });
      } else {
        console.log('❌ Affiliate link not found or inactive:', validatedData.affiliateSlug);
      }
    } else {
      console.log('❌ No affiliateSlug provided in request');
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
        select: { id: true, name: true, sku: true, stock: true }
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
        const product = products.find(p => p.id === productId);
        console.log(`Preparing order item: productId=${productId}, price=${item.price}, quantity=${item.quantity}`);
        return {
          productId: productId,
          productName: product?.name || item.name, // Store product name at time of order
          productSku: product?.sku || `SKU-${productId}`, // Store product SKU at time of order
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

      // Create affiliate commission if applicable (NEW: Per product commission)
      if (affiliateLink && affiliateUser) {
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
          console.log('Processing commissions for order items...');
          let totalCommissionAmount = 0;

          // Process commission for each order item that matches affiliate product
          for (const orderItem of orderWithItems.orderItems) {
            // Only create commission if this order item is for the affiliate product
            if (orderItem.productId === affiliateLink.productId) {
              // Get product commission rate
              const product = await tx.product.findUnique({
                where: { id: orderItem.productId },
                select: {
                  commissionRate: true,
                  allowAffiliate: true,
                  name: true
                }
              });

              if (product && product.allowAffiliate && product.commissionRate > 0) {
                const itemTotal = orderItem.price * orderItem.quantity;
                const commissionAmount = itemTotal * product.commissionRate;
                totalCommissionAmount += commissionAmount;

                console.log('Creating product commission:', {
                  productName: product.name,
                  productId: orderItem.productId,
                  quantity: orderItem.quantity,
                  price: Number(orderItem.price),
                  itemTotal: Number(itemTotal),
                  commissionRate: Number(product.commissionRate),
                  commissionAmount: Number(commissionAmount)
                });

                // Create direct commission
                await tx.commission.create({
                  data: {
                    userId: affiliateUser.id,
                    orderId: newOrder.id,
                    orderItemId: orderItem.id,
                    productId: orderItem.productId,
                    affiliateLinkId: affiliateLink.id,
                    referredUserId: session.user.id,
                    level: 1,
                    commissionType: 'DIRECT',
                    productQuantity: orderItem.quantity,
                    productPrice: orderItem.price,
                    orderAmount: itemTotal,
                    commissionRate: product.commissionRate,
                    amount: commissionAmount,
                    status: 'PENDING'
                  }
                });

                // Create multi-level commissions for upline
                await createMultiLevelCommissions(tx, {
                  affiliateUserId: affiliateUser.id,
                  orderId: newOrder.id,
                  orderItemId: orderItem.id,
                  productId: orderItem.productId,
                  referredUserId: session.user.id,
                  itemTotal: itemTotal,
                  baseCommissionAmount: commissionAmount
                });
              }
            }
          }

          if (totalCommissionAmount > 0) {
            // Update affiliate link stats
            await tx.affiliateLink.update({
              where: { id: affiliateLink.id },
              data: {
                totalConversions: { increment: 1 },
                totalCommission: { increment: totalCommissionAmount },
                lastConversionAt: new Date()
              }
            });

            // Update user affiliate stats
            await tx.user.update({
              where: { id: affiliateUser.id },
              data: {
                totalSales: { increment: totalCommissionAmount },
                totalCommission: { increment: totalCommissionAmount }
              }
            });

            console.log('✅ Product commissions created successfully. Total:', Number(totalCommissionAmount));
          }
        } else {
          console.log('No commission - not eligible:', {
            customerId: session.user.id,
            affiliateUserId: affiliateUser.id,
            firstOrderOnly,
            reason: firstOrderOnly ? 'Customer has previous orders' : 'Commission settings'
          });
        }
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