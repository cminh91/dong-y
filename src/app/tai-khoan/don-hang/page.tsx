import { Suspense } from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { OrdersTab } from "@/components/account/tabs/orders-tab"

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

export default async function DonHangPage() {
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            }>
              <OrdersTab userPayload={userPayload} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
