import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import AdminSidebar from '@/components/admin/Sidebar';
import { handleLogout } from './actions';

interface UserPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  iat: number;
  exp: number;
}

const verifyToken = (token: string): UserPayload | null => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, secret) as UserPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value;

  if (!authToken) {
    redirect("/dang-nhap");
  }

  const userPayload = verifyToken(authToken);
  if (!userPayload) {
    redirect("/dang-nhap");
  }

  // Check if user is admin
  if (userPayload.role !== "ADMIN") {
    redirect("/tai-khoan");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* Mobile menu button - sẽ được render bởi AdminSidebar */}
                <div className="lg:hidden mr-3">
                  <AdminSidebar />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Admin Panel</h1>
                  <p className="text-xs lg:text-sm text-gray-600 mt-1">Quản lý hệ thống Đông Y Pharmacy</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="text-xs lg:text-sm text-gray-500">
                  Xin chào, <span className="font-medium text-gray-900">{userPayload.fullName || 'Admin'}</span>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <a
                  href="/"
                  className="text-xs lg:text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  <i className="fas fa-external-link-alt mr-1"></i>
                  <span className="hidden sm:inline">Về trang chủ</span>
                  <span className="sm:hidden">Home</span>
                </a>
                 <button
                   onClick={handleLogout}
                   className="text-xs lg:text-sm text-red-600 hover:text-red-700 font-medium"
                 >
                   Đăng xuất
                 </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}