'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin, hashPassword } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { User, UserRole, UserStatus } from '@prisma/client'

export async function getUsers() {
  await requireAdmin()
  
  return prisma.user.findMany({
    include: {
      idCards: true,
      bankAccounts: true,
      _count: {
        select: {
          orders: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getUserById(id: string) {
  await requireAdmin()
  
  return prisma.user.findUnique({
    where: { id },
    include: {
      idCards: true,
      bankAccounts: true,
      orders: {
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      }
    }
  })
}

export async function createUser(formData: FormData) {
  await requireAdmin()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const address = formData.get('address') as string
  const role = formData.get('role') as UserRole

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('Email đã tồn tại')
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phoneNumber,
        address,
        role,
        status: 'ACTIVE'
      }
    })

    revalidatePath('/admin/users')
    redirect('/admin/users')
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
  }
}

export async function updateUser(id: string, formData: FormData) {
  await requireAdmin()

  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const address = formData.get('address') as string
  const role = formData.get('role') as UserRole
  const status = formData.get('status') as UserStatus

  try {
    // Check if email already exists for other users
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id }
      }
    })

    if (existingUser) {
      throw new Error('Email đã tồn tại')
    }

    await prisma.user.update({
      where: { id },
      data: {
        email,
        fullName,
        phoneNumber,
        address,
        role,
        status
      }
    })

    revalidatePath('/admin/users')
    redirect('/admin/users')
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
  }
}

export async function deleteUser(id: string) {
  await requireAdmin()

  try {
    await prisma.user.delete({
      where: { id }
    })

    revalidatePath('/admin/users')
  } catch (error) {
    throw new Error('Không thể xóa người dùng')
  }
}

export async function updateUserStatus(id: string, status: UserStatus) {
  await requireAdmin()

  try {
    await prisma.user.update({
      where: { id },
      data: { status }
    })

    revalidatePath('/admin/users')
  } catch (error) {
    throw new Error('Không thể cập nhật trạng thái')
  }
}
