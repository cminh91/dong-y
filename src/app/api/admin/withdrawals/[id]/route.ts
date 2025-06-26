import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTokenFromRequest } from '@/lib/auth';

// Update withdrawal status (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userPayload = await verifyTokenFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, adminNote } = body;
    const withdrawalId = params.id;

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get current withdrawal
    const currentWithdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            totalWithdrawn: true
          }
        }
      }
    });

    if (!currentWithdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    // Use transaction to update withdrawal and user balance
    const result = await prisma.$transaction(async (tx) => {
      // Update withdrawal status
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status,
          processedAt: new Date(),
          adminNote: adminNote || null
        },
        include: {
          bankAccount: {
            select: {
              bankName: true,
              accountNumber: true,
              accountName: true
            }
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      // Handle status-specific logic
      if (status === 'COMPLETED' && currentWithdrawal.status !== 'COMPLETED') {
        // Add to totalWithdrawn when completing
        await tx.user.update({
          where: { id: currentWithdrawal.userId },
          data: {
            totalWithdrawn: {
              increment: Number(currentWithdrawal.amount)
            }
          }
        });
      } else if (currentWithdrawal.status === 'COMPLETED' && status !== 'COMPLETED') {
        // Remove from totalWithdrawn when changing from completed
        await tx.user.update({
          where: { id: currentWithdrawal.userId },
          data: {
            totalWithdrawn: {
              decrement: Number(currentWithdrawal.amount)
            }
          }
        });
      }

      // Handle rejected/cancelled withdrawals - refund balance
      if ((status === 'REJECTED' || status === 'CANCELLED') && 
          currentWithdrawal.status === 'PENDING') {
        await tx.user.update({
          where: { id: currentWithdrawal.userId },
          data: {
            availableBalance: {
              increment: Number(currentWithdrawal.amount)
            }
          }
        });
      }

      return updatedWithdrawal;
    });

    return NextResponse.json({
      success: true,
      data: {
        withdrawal: {
          id: result.id,
          amount: Number(result.amount),
          status: result.status,
          processedAt: result.processedAt,
          adminNote: result.adminNote,
          user: result.user,
          bankAccount: result.bankAccount
        },
        message: `Withdrawal ${status.toLowerCase()} successfully`
      }
    });

  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get withdrawal details (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userPayload = await verifyTokenFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        bankAccount: {
          select: {
            bankName: true,
            accountNumber: true,
            accountName: true,
            branch: true
          }
        }
      }
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        withdrawal: {
          id: withdrawal.id,
          amount: Number(withdrawal.amount),
          status: withdrawal.status,
          requestedAt: withdrawal.requestedAt,
          processedAt: withdrawal.processedAt,
          adminNote: withdrawal.adminNote,
          userNote: withdrawal.userNote,
          user: withdrawal.user,
          bankAccount: withdrawal.bankAccount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching withdrawal:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
