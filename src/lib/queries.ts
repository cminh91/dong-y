"use server";
import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

// CREATE
export async function createCategory(data: Prisma.CategoryCreateInput) {
  return await prisma.category.create({
    data,
  });
}

// READ - get all categories
export async function getAllCategories() {
  return await prisma.category.findMany();
}

// READ - get category by id
export async function getCategoryById(id: string) {
  return await prisma.category.findUnique({
    where: { id },
  });
}

// Lấy danh sách danh mục cha (không phải chính nó, chỉ lấy cấp 1 hoặc 2)
export async function getParentCategories(excludeId?: string) {
  return prisma.category.findMany({
    where: {
      AND: [
        { status: 'ACTIVE' },
        excludeId ? { id: { not: excludeId } } : {},
        // { level: { in: [1, 2] } },
      ],
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  });
}

// UPDATE
export async function updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
  return await prisma.category.update({
    where: { id },
    data,
  });
}

// DELETE
export async function deleteCategory(id: string) {
  return await prisma.category.delete({
    where: { id },
  });
}

// CREATE - create product
export async function createProduct(data: Prisma.ProductCreateInput) {
  // TODO: Implement image upload logic if needed server-side
  // For now, assume data.imageUrls is already a string array of URLs
  return await prisma.product.create({
    data,
  });
}

// READ - get all products (basic)
export async function getAllProducts() {
  return await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// READ - get product by id
export async function getProductById(id: string): Promise<Prisma.ProductGetPayload<{ include: { category: { select: { id: true, name: true } } } }> | null> {
  return await prisma.product.findUnique({
    where: { id },
    include: { // Sử dụng lại include
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

// UPDATE - update product
export async function updateProduct(id: string, data: Prisma.ProductUpdateInput) {
  return await prisma.product.update({
    where: { id },
    data,
  });
}

// DELETE - delete product
export async function deleteProduct(id: string) {
  return await prisma.product.delete({
    where: { id },
  });
}
