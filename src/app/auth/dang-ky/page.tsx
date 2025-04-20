"use client";

import { FC, FormEvent, useState } from "react";
import Link from "next/link";

const RegisterPage: FC = () => {
  const [role, setRole] = useState<string>("customer"); // Mặc định là 'customer'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Xử lý logic gửi form, bao gồm giá trị của 'role'
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      role: role,
    };
    console.log("Form data:", data);
    // Thêm logic gửi API hoặc xử lý đăng ký tại đây
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-green-700">
              Đông Y Pharmacy
            </Link>
            <p className="text-gray-600 mt-2">Tạo tài khoản mới</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập email"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Vai trò</label>
                <select
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="customer">Khách hàng</option>
                  <option value="affiliate">Đối tác</option>
                  <option value="staff">Cộng tác viên</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2"
              >
                Đăng ký
              </button>
            </form>

            <p className="text-center mt-4 text-gray-600">
              Đã có tài khoản?
              <Link href="/auth/dang-nhap" className="text-green-600 hover:underline ml-1">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;