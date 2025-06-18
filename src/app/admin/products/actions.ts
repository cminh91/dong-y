'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ProductStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

function generateSKU(): string {
  return 'PRD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()
}

export async function getProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      _count: {
        select: {
          orderItems: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      orderItems: {
        include: {
          order: true
        }
      }
    }
  })
}

export async function createProduct(formData: FormData) {
  await requireAdmin()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const price = parseFloat(formData.get('price') as string)
  const salePriceStr = formData.get('salePrice') as string
  const salePrice = salePriceStr ? parseFloat(salePriceStr) : null
  const stock = parseInt(formData.get('stock') as string) || 0
  const categoryId = formData.get('categoryId') as string
  const status = formData.get('status') as ProductStatus
  const isFeatured = formData.get('isFeatured') === 'true'
  const imagesStr = formData.get('images') as string
  
  try {
    const slug = generateSlug(name)
    const sku = generateSKU()

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })

    if (existingProduct) {
      throw new Error('Tên sản phẩm đã tồn tại')
    }

    // Parse images
    let images = null
    if (imagesStr) {
      try {
        images = JSON.parse(imagesStr)
      } catch {
        images = [imagesStr]
      }
    }

    await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        content: content || null,
        price: new Decimal(price),
        salePrice: salePrice ? new Decimal(salePrice) : null,
        sku,
        stock,
        categoryId,
        status,
        isFeatured,
        images
      }
    })

    revalidatePath('/admin/products')
    redirect('/admin/products')
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
  }
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const price = parseFloat(formData.get('price') as string)
  const salePriceStr = formData.get('salePrice') as string
  const salePrice = salePriceStr ? parseFloat(salePriceStr) : null
  const stock = parseInt(formData.get('stock') as string) || 0
  const categoryId = formData.get('categoryId') as string
  const status = formData.get('status') as ProductStatus
  const isFeatured = formData.get('isFeatured') === 'true'
  const imagesStr = formData.get('images') as string

  try {
    const slug = generateSlug(name)

    // Check if slug already exists for other products
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    })

    if (existingProduct) {
      throw new Error('Tên sản phẩm đã tồn tại')
    }

    // Parse images
    let images = null
    if (imagesStr) {
      try {
        images = JSON.parse(imagesStr)
      } catch {
        images = [imagesStr]
      }
    }

    await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        content: content || null,
        price: new Decimal(price),
        salePrice: salePrice ? new Decimal(salePrice) : null,
        stock,
        categoryId,
        status,
        isFeatured,
        images
      }
    })

    revalidatePath('/admin/products')
    redirect('/admin/products')
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin()

  try {
    // Check if product has orders
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    })

    if (!product) {
      throw new Error('Sản phẩm không tồn tại')
    }

    if (product.orderItems.length > 0) {
      throw new Error('Không thể xóa sản phẩm đã có đơn hàng')
    }

    await prisma.product.delete({
      where: { id }
    })

    revalidatePath('/admin/products')
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Không thể xóa sản phẩm')
  }
}

export async function updateProductStatus(id: string, status: ProductStatus) {
  await requireAdmin()

  try {
    await prisma.product.update({
      where: { id },
      data: { status }
    })

    revalidatePath('/admin/products')
  } catch (error) {
    throw new Error('Không thể cập nhật trạng thái')
  }
}

export async function updateProductStock(id: string, stock: number) {
  await requireAdmin()

  try {
    await prisma.product.update({
      where: { id },
      data: { stock }
    })

    revalidatePath('/admin/products')
  } catch (error) {
    throw new Error('Không thể cập nhật số lượng')
  }
}
