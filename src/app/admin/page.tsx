"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chào mừng đến với Admin Panel
        </h1>
        <p className="text-gray-600">
          Quản lý website Đông Y Pharmacy một cách dễ dàng và hiệu quả
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/dashboard"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-blue-500 text-white p-3 rounded-full">
              <i className="fas fa-tachometer-alt text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Dashboard</h3>
              <p className="text-gray-600">Xem tổng quan hệ thống</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-green-500 text-white p-3 rounded-full">
              <i className="fas fa-box text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Sản phẩm</h3>
              <p className="text-gray-600">Quản lý sản phẩm</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-purple-500 text-white p-3 rounded-full">
              <i className="fas fa-shopping-cart text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Đơn hàng</h3>
              <p className="text-gray-600">Quản lý đơn hàng</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-orange-500 text-white p-3 rounded-full">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Người dùng</h3>
              <p className="text-gray-600">Quản lý người dùng</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-red-500 text-white p-3 rounded-full">
              <i className="fas fa-tags text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Danh mục</h3>
              <p className="text-gray-600">Quản lý danh mục</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-gray-500 text-white p-3 rounded-full">
              <i className="fas fa-cog text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Cài đặt</h3>
              <p className="text-gray-600">Cấu hình hệ thống</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Thống kê nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">124</div>
            <div className="text-sm text-gray-600">Đơn hàng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">85</div>
            <div className="text-sm text-gray-600">Khách hàng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">156</div>
            <div className="text-sm text-gray-600">Sản phẩm</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">45.5M₫</div>
            <div className="text-sm text-gray-600">Doanh thu</div>
          </div>
        </div>
      </div>
    </div>
  );
}