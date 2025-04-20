// SSR: Lấy dữ liệu danh mục, truyền cho client component
import { notFound } from "next/navigation";

// type Category = {
//   id: string;
//   name: string;
//   imageUrl: string;
//   slug: string;
//   description: string;
//   productCount: number;
//   isActive: boolean;
//   sortOrder: number;
// };

// Đã xóa code API, trả về notFound luôn
export default function EditCategoryPage() {
  return notFound();
}