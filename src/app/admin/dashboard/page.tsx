"use client";

import AdminDashboard from '@/components/admin/Dashboard';

// Dữ liệu mẫu thay thế cho việc fetch từ API
const mockDashboardData = {
  stats: [
    {
      title: "Tổng doanh thu",
      value: "45.500.000₫",
      change: "+12%",
      icon: "fas fa-chart-line",
      color: "bg-green-600"
    },
    {
      title: "Đơn hàng",
      value: "124",
      change: "+8%",
      icon: "fas fa-shopping-cart",
      color: "bg-blue-600"
    },
    {
      title: "Khách hàng",
      value: "85",
      change: "+5%",
      icon: "fas fa-users",
      color: "bg-purple-600"
    },
    {
      title: "Tỷ lệ chuyển đổi",
      value: "3.2%",
      change: "+0.5%",
      icon: "fas fa-exchange-alt",
      color: "bg-orange-600"
    }
  ],
  recentOrders: [
    {
      id: "DH001",
      customer: "Nguyễn Văn A",
      date: "15/05/2024",
      total: "1.250.000₫",
      status: "Đã giao"
    },
    {
      id: "DH002",
      customer: "Trần Thị B",
      date: "14/05/2024",
      total: "850.000₫",
      status: "Đang giao"
    },
    {
      id: "DH003",
      customer: "Lê Văn C",
      date: "13/05/2024",
      total: "1.450.000₫",
      status: "Đang xử lý"
    },
    {
      id: "DH004",
      customer: "Phạm Thị D",
      date: "12/05/2024",
      total: "650.000₫",
      status: "Đã giao"
    },
    {
      id: "DH005",
      customer: "Hoàng Văn E",
      date: "11/05/2024",
      total: "950.000₫",
      status: "Đã hủy"
    }
  ],
  topProducts: [
    {
      name: "HEPASAKY GOLD",
      sales: 45,
      revenue: "14.400.000₫"
    },
    {
      name: "LYPASAKY",
      sales: 32,
      revenue: "12.800.000₫"
    },
    {
      name: "Trà Thảo Mộc",
      sales: 28,
      revenue: "3.360.000₫"
    },
    {
      name: "Trọng Đông Hoàn",
      sales: 24,
      revenue: "9.600.000₫"
    }
  ]
};

// Chuyển sang client component để tránh lỗi hydration
export default function DashboardPage() {
  return <AdminDashboard {...mockDashboardData} />;
}