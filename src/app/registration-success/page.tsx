import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RegistrationSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg md:p-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-green-800 md:text-3xl">Đăng ký thành công!</h1>

          <p className="text-gray-600">
            Cảm ơn bạn đã đăng ký tài khoản tại Đông Y. Tài khoản của bạn đang chờ được xác nhận bởi quản trị viên.
          </p>

          <p className="text-gray-600">Chúng tôi sẽ thông báo cho bạn qua email khi tài khoản của bạn được xác nhận.</p>

          <div className="mt-6 w-full">
            <Button asChild className="w-full bg-green-700 hover:bg-green-800">
              <Link href="/login">Quay lại đăng nhập</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email{" "}
            <a href="mailto:support@dongy.com" className="text-green-700 hover:text-green-800">
              support@dongy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
