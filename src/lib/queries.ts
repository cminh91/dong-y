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
