import { LoginForm } from "@/components/login-form"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

interface UserPayload {
  userId: string;    // Đổi id thành userId cho đồng nhất với JWT payload
  email: string;
  role: string;
  fullName?: string; // Thêm fullName để hiển thị tên trong admin panel
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

export default async function LoginPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value;

  if (authToken) {
    const userPayload = verifyToken(authToken);    if (userPayload) {
      // Admin và Staff được phép vào admin panel
      if (["ADMIN", "STAFF"].includes(userPayload.role)) {
        redirect("/admin");
      } else {
        // Các role khác (CUSTOMER, COLLABORATOR, AGENT) về trang tài khoản
        redirect("/tai-khoan");
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-green-800 md:text-3xl">Đăng nhập</h1>
          <p className="mt-2 text-gray-600">Vui lòng đăng nhập để tiếp tục</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
