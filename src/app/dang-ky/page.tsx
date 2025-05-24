import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-green-800 md:text-3xl">Đăng ký tài khoản</h1>
          <p className="mt-2 text-gray-600">Vui lòng điền đầy đủ thông tin để đăng ký tài khoản</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
