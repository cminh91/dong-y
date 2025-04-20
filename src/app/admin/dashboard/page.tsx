import AdminDashboard from '@/components/admin/Dashboard';

// Sử dụng server component để fetch dữ liệu dashboard từ API
async function getDashboardData() {
  const res = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/admin/dashboard`, {
    cache: 'no-store',
    // Nếu cần truyền cookie/session cho SSR, dùng credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <AdminDashboard {...data} />;
}