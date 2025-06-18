import { Suspense } from "react"
import { AccountPageSidebar } from "@/components/account/account-page-sidebar"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

interface UserPayload {
  userId: string
  email: string
  role: string
  fullName: string
  iat: number
  exp: number
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

export default async function TaiKhoanPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value;

  if (!authToken) {
    redirect("/dang-nhap");
  }

  const userPayload = verifyToken(authToken);
  if (!userPayload) {
    redirect("/dang-nhap");
  }

  // Nếu là admin thì chuyển đến admin panel
  if (userPayload.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <AccountPageSidebar userPayload={userPayload} />
      </Suspense>
    </div>
  )
}
