import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userPayload = await verifyTokenFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user settings and related data
    const [user, bankAccounts, idCards] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userPayload.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          address: true,
          referralCode: true,
          affiliateLevel: true,
          commissionRate: true,
          status: true,
          createdAt: true
        }
      }),

      prisma.bankAccount.findMany({
        where: { userId: userPayload.userId },
        orderBy: { createdAt: 'desc' }
      }),

      prisma.idCard.findMany({
        where: { userId: userPayload.userId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get affiliate settings/preferences (if you have a separate table)
    // For now, we'll use user fields directly

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          ...user,
          commissionRate: Number(user.commissionRate)
        },
        bankAccounts: bankAccounts.map(account => ({
          ...account,
          // Hide sensitive info, show only last 4 digits
          accountNumber: account.accountNumber ? account.accountNumber.slice(-4).padStart(account.accountNumber.length, '*') : '',
          isVerified: account.isPrimary // Use isPrimary as verification status
        })),
        idCards: idCards.map(card => ({
          ...card,
          // Hide sensitive info
          idCardNumber: card.idCardNumber ? card.idCardNumber.slice(-4).padStart(card.idCardNumber.length, '*') : '',
          isVerified: card.status === 'VERIFIED'
        })),
        preferences: {
          // Add any affiliate-specific preferences here
          emailNotifications: true,
          smsNotifications: false,
          weeklyReports: true,
          monthlyReports: true
        }
      }
    });

  } catch (error) {
    console.error('Error fetching affiliate settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update affiliate settings
export async function PUT(request: NextRequest) {
  try {
    const userPayload = await verifyTokenFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'profile':
        return await updateProfile(userPayload.userId, data);
      case 'bank_account':
        return await addBankAccount(userPayload.userId, data);
      case 'id_card':
        return await addIdCard(userPayload.userId, data);
      case 'preferences':
        return await updatePreferences(userPayload.userId, data);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid update type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error updating affiliate settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update profile information
async function updateProfile(userId: string, data: any) {
  const { fullName, phoneNumber, address } = data;

  // Validation
  if (!fullName || fullName.trim().length < 2) {
    return NextResponse.json(
      { success: false, error: 'Full name must be at least 2 characters' },
      { status: 400 }
    );
  }

  if (!phoneNumber || !/^[0-9]{10,11}$/.test(phoneNumber)) {
    return NextResponse.json(
      { success: false, error: 'Invalid phone number format' },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address?.trim() || null
    },
    select: {
      fullName: true,
      phoneNumber: true,
      address: true
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      profile: updatedUser,
      message: 'Profile updated successfully'
    }
  });
}

// Add bank account
async function addBankAccount(userId: string, data: any) {
  const { bankName, accountNumber, accountHolder, branch } = data;

  // Validation
  if (!bankName || !accountNumber || !accountHolder) {
    return NextResponse.json(
      { success: false, error: 'Bank name, account number, and account holder are required' },
      { status: 400 }
    );
  }

  if (!/^[0-9]{8,20}$/.test(accountNumber)) {
    return NextResponse.json(
      { success: false, error: 'Invalid account number format' },
      { status: 400 }
    );
  }

  // Check if account number already exists for this user
  const existingAccount = await prisma.bankAccount.findFirst({
    where: {
      userId,
      accountNumber
    }
  });

  if (existingAccount) {
    return NextResponse.json(
      { success: false, error: 'This bank account already exists' },
      { status: 400 }
    );
  }

  const bankAccount = await prisma.bankAccount.create({
    data: {
      userId,
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountHolder.trim(), // Use accountName instead of accountHolder
      branch: branch?.trim() || '',
      isPrimary: false // Requires admin verification
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      bankAccount: {
        ...bankAccount,
        accountNumber: bankAccount.accountNumber.slice(-4).padStart(bankAccount.accountNumber.length, '*'),
        isVerified: false
      },
      message: 'Bank account added successfully. Verification required.'
    }
  });
}

// Add ID card
async function addIdCard(userId: string, data: any) {
  const { idCardNumber, frontImage, backImage } = data;

  // Validation
  if (!idCardNumber || !frontImage) {
    return NextResponse.json(
      { success: false, error: 'ID card number and front image are required' },
      { status: 400 }
    );
  }

  if (!/^[0-9]{9,12}$/.test(idCardNumber)) {
    return NextResponse.json(
      { success: false, error: 'Invalid ID card number format' },
      { status: 400 }
    );
  }

  // Check if ID number already exists
  const existingId = await prisma.idCard.findFirst({
    where: { idCardNumber }
  });

  if (existingId) {
    return NextResponse.json(
      { success: false, error: 'This ID card number is already registered' },
      { status: 400 }
    );
  }

  const idCard = await prisma.idCard.create({
    data: {
      userId,
      idCardNumber: idCardNumber.trim(),
      frontImage: frontImage.trim(),
      backImage: backImage?.trim() || '',
      status: 'PENDING' // Requires admin verification
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      idCard: {
        ...idCard,
        idCardNumber: idCard.idCardNumber.slice(-4).padStart(idCard.idCardNumber.length, '*'),
        isVerified: false
      },
      message: 'ID card added successfully. Verification required.'
    }
  });
}

// Update preferences
async function updatePreferences(userId: string, data: any) {
  const { emailNotifications, smsNotifications, weeklyReports, monthlyReports } = data;

  // For now, we'll store preferences in a JSON field or separate table
  // This is a simplified implementation
  
  return NextResponse.json({
    success: true,
    data: {
      preferences: {
        emailNotifications: Boolean(emailNotifications),
        smsNotifications: Boolean(smsNotifications),
        weeklyReports: Boolean(weeklyReports),
        monthlyReports: Boolean(monthlyReports)
      },
      message: 'Preferences updated successfully'
    }
  });
}

// Delete bank account or ID card
export async function DELETE(request: NextRequest) {
  try {
    const userPayload = await verifyTokenFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'bank_account' or 'id_card'
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Type and ID are required' },
        { status: 400 }
      );
    }

    if (type === 'bank_account') {
      await prisma.bankAccount.delete({
        where: {
          id,
          userId: userPayload.userId
        }
      });

      return NextResponse.json({
        success: true,
        data: { message: 'Bank account deleted successfully' }
      });
    }

    if (type === 'id_card') {
      await prisma.idCard.delete({
        where: {
          id,
          userId: userPayload.userId
        }
      });

      return NextResponse.json({
        success: true,
        data: { message: 'ID card deleted successfully' }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
