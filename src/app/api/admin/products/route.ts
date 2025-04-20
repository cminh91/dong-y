import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
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

    // Có thể cần thêm logic phân trang và lọc/tìm kiếm ở đây sau

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Lỗi khi lấy danh sách sản phẩm' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Thiếu ID sản phẩm' }, { status: 400 });
    }

    // TODO: Có thể thêm kiểm tra ràng buộc trước khi xóa sản phẩm (ví dụ: sản phẩm có trong đơn hàng không)

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Lỗi khi xóa sản phẩm' }, { status: 500 });
  }
}