import AdminSidebar from '@/components/admin/Sidebar';
// Tạm thời vô hiệu hóa xác thực admin
// import { getServerSession } from "next-auth/next";
// import { redirect } from "next/navigation";
// import type { Session } from "next-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Tạm thời vô hiệu hóa kiểm tra session và chuyển hướng
  // const session = await getServerSession() as Session | null;
  // if (!session || session.user?.role !== "ADMIN") {
  //   redirect("/admin-login");
  // }
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}