import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
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
