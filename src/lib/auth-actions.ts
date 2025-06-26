'use server'

import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống')
})

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  role: z.enum(['CUSTOMER', 'STAFF', 'COLLABORATOR', 'AGENT']).optional().default('CUSTOMER'),
  // Optional fields for advanced registration
  idCardNumber: z.string().optional(),
  frontIdImage: z.string().optional(),
  backIdImage: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  branch: z.string().optional(),
  accountName: z.string().optional()
})

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validate input
    const validatedData = loginSchema.parse({ email, password })

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng')
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)
    if (!isValidPassword) {
      throw new Error('Email hoặc mật khẩu không đúng')
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new Error('Tài khoản chưa được kích hoạt hoặc đã bị khóa')
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })    // Redirect based on role
    if (['ADMIN', 'STAFF'].includes(user.role)) {
      // Admin và Staff được vào trang admin
      redirect('/admin')
    } else {
      // Các role khác (CUSTOMER, COLLABORATOR, AGENT) về trang tài khoản
      redirect('/tai-khoan')
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message)
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Có lỗi xảy ra khi đăng nhập')
  }
}

export async function registerAction(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const address = formData.get('address') as string
    const role = formData.get('role') as string || 'CUSTOMER'
    const referralCode = formData.get('referralCode') as string | null
      // Optional fields for advanced registration
    const idCardNumber = formData.get('idCardNumber') as string | null
    const frontIdImage = formData.get('frontIdImage') as string | null
    const backIdImage = formData.get('backIdImage') as string | null
    const bankName = formData.get('bankName') as string | null
    const accountNumber = formData.get('accountNumber') as string | null
    const branch = formData.get('branch') as string | null
    const accountName = formData.get('accountName') as string | null
      // Validate input
    const dataToValidate: any = {
      email,
      password,
      fullName,
      phoneNumber,
      address,
      role
    }

    // Only add optional fields if they have values
    if (idCardNumber) dataToValidate.idCardNumber = idCardNumber
    if (frontIdImage) dataToValidate.frontIdImage = frontIdImage
    if (backIdImage) dataToValidate.backIdImage = backIdImage
    if (bankName) dataToValidate.bankName = bankName
    if (accountNumber) dataToValidate.accountNumber = accountNumber
    if (branch) dataToValidate.branch = branch
    if (accountName) dataToValidate.accountName = accountName

    const validatedData = registerSchema.parse(dataToValidate)    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return {
        success: false,
        error: 'Email đã được sử dụng',
        field: 'email'
      }
    }// Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Find referrer if referral code is provided
    let referrerId: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode }
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Create user with transaction to ensure data consistency
    interface RegisterValidatedData {
      email: string;
      password: string;
      fullName: string;
      phoneNumber: string;
      address: string;
      role: string;
      idCardNumber?: string;
      frontIdImage?: string;
      backIdImage?: string;
      bankName?: string;
      accountNumber?: string;
      branch?: string;
      accountName?: string;
    }

    interface UserResult {
      id: string;
      email: string;
      password: string;
      fullName: string;
      phoneNumber: string;
      address: string;
      role: string;
      status: string;
      referredBy?: string | null;
      // Add other user fields if needed
    }

    interface TransactionContext {
      user: typeof prisma.user;
      idCard: typeof prisma.idCard;
      bankAccount: typeof prisma.bankAccount;
    }

    const result: UserResult = await prisma.$transaction(async (tx: TransactionContext): Promise<UserResult> => {
      // Create user
      const user: UserResult = await tx.user.create({
      data: {
        email: (validatedData as RegisterValidatedData).email,
        password: hashedPassword, // Use hashed password instead of plain text
        fullName: (validatedData as RegisterValidatedData).fullName,
        phoneNumber: (validatedData as RegisterValidatedData).phoneNumber,
        address: (validatedData as RegisterValidatedData).address,
        role: (validatedData as RegisterValidatedData).role as any,
        status: 'PENDING', // Tất cả tài khoản mới đều chờ admin kích hoạt
        referredBy: referrerId // Set the referrer
      }
      })

      // Create ID card if provided (for advanced roles)
      if (
      (validatedData as RegisterValidatedData).idCardNumber &&
      (validatedData as RegisterValidatedData).frontIdImage &&
      (validatedData as RegisterValidatedData).backIdImage
      ) {
      await tx.idCard.create({
        data: {
        userId: user.id,
        idCardNumber: (validatedData as RegisterValidatedData).idCardNumber!,
        frontImage: (validatedData as RegisterValidatedData).frontIdImage!,
        backImage: (validatedData as RegisterValidatedData).backIdImage!
        // Note: status field removed - using verifiedAt/rejectedAt timestamps instead
        }
      })
      }
      // Create bank account if provided (for advanced roles)
      if (
      (validatedData as RegisterValidatedData).bankName &&
      (validatedData as RegisterValidatedData).accountNumber &&
      (validatedData as RegisterValidatedData).branch &&
      (validatedData as RegisterValidatedData).accountName
      ) {
      await tx.bankAccount.create({
        data: {
        userId: user.id,
        bankName: (validatedData as RegisterValidatedData).bankName as any, // Cast to enum
        accountNumber: (validatedData as RegisterValidatedData).accountNumber!,
        branch: (validatedData as RegisterValidatedData).branch!,
        accountName: (validatedData as RegisterValidatedData).accountName!
        }
      })
      }
      return user
    })

    // Call after registration hook to generate referral code and handle referral logic
    const { afterUserRegistration } = await import('@/lib/user-hooks');
    await afterUserRegistration(result.id, referralCode || undefined);

    return { success: true }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
        field: error.errors[0].path[0] as string
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: false,
      error: 'Có lỗi xảy ra khi đăng ký'
    }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('authToken')

  redirect('/dang-nhap')
}
