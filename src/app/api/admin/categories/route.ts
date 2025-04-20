import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: {
            name: true,
          },
        },
      },
    });

    // Tính toán level và parentName cho từng danh mục
    const categoriesWithLevelAndParentName = categories.map((category: Category & { parent?: { name: string } | null }) => {
      let level = 1;
      let currentCategory = category;
      while (currentCategory.parentId) {
        const parent = categories.find((cat: Category) => cat.id === currentCategory.parentId);
        if (parent) {
          level++;
          currentCategory = parent;
        } else {
          // Thoát vòng lặp nếu không tìm thấy danh mục cha (trường hợp dữ liệu không nhất quán)
          break;
        }
      }

      const parentCategory = categories.find((cat: Category) => cat.id === category.parentId);
      const parentName = parentCategory ? parentCategory.name : undefined;

      return {
        ...category,
        level,
        parentName,
      };
    });

    return NextResponse.json(categoriesWithLevelAndParentName);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Lỗi khi lấy danh sách danh mục' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Thiếu ID danh mục' }, { status: 400 });
    }

    // Kiểm tra xem danh mục có danh mục con không
    const childCategories = await prisma.category.findMany({
      where: {
        parentId: id,
      },
    });

    if (childCategories.length > 0) {
      return NextResponse.json({ message: 'Không thể xóa danh mục có danh mục con' }, { status: 400 });
    }

    // Kiểm tra xem danh mục có sản phẩm không
    const productsInCategory = await prisma.product.findMany({
      where: {
        categoryId: id,
      },
    });

    if (productsInCategory.length > 0) {
      return NextResponse.json({ message: 'Không thể xóa danh mục có sản phẩm' }, { status: 400 });
    }
    
    // Kiểm tra xem danh mục có bài viết không
    const postsInCategory = await prisma.post.findMany({
      where: {
        categoryId: id,
      },
    });

    if (postsInCategory.length > 0) {
      return NextResponse.json({ message: 'Không thể xóa danh mục có bài viết' }, { status: 400 });
    }


    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ message: 'Lỗi khi xóa danh mục' }, { status: 500 });
  }
}