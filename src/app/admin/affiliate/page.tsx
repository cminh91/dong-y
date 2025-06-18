"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, Link2, DollarSign, FileCheck,
  TrendingUp, TrendingDown, Activity, Clock, ChevronRight
} from 'lucide-react'

interface DashboardStats {
  totalAffiliates: number
  activeAffiliates: number
  totalLinks: number
  activeLinks: number
  totalClicks: number
  totalConversions: number
  totalCommissions: number
  pendingCommissions: number
  totalWithdrawals: number
  pendingWithdrawals: number
  monthlyGrowth: number
  conversionRate: number
}

export default function AffiliateAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch data from multiple API endpoints
      const [usersResponse, linksResponse, commissionsResponse, withdrawalsResponse] = await Promise.all([
        fetch('/api/admin/affiliate/users/stats'),
        fetch('/api/admin/affiliate/links/stats'),
        fetch('/api/admin/affiliate/commissions/stats'),
        fetch('/api/admin/affiliate/withdrawals/stats')
      ])

      const [usersData, linksData, commissionsData, withdrawalsData] = await Promise.all([
        usersResponse.json(),
        linksResponse.json(),
        commissionsResponse.json(),
        withdrawalsResponse.json()
      ])

      if (usersData.success && linksData.success && commissionsData.success && withdrawalsData.success) {
        const combinedStats: DashboardStats = {
          totalAffiliates: usersData.data.totalAffiliates,
          activeAffiliates: usersData.data.activeAffiliates,
          totalLinks: linksData.data.totalLinks,
          activeLinks: linksData.data.activeLinks,
          totalClicks: linksData.data.totalClicks,
          totalConversions: linksData.data.totalConversions,
          totalCommissions: commissionsData.data.total.amount,
          pendingCommissions: commissionsData.data.pending.amount,
          totalWithdrawals: withdrawalsData.data.total.amount,
          pendingWithdrawals: withdrawalsData.data.pending.amount,
          conversionRate: linksData.data.conversionRate,
          monthlyGrowth: usersData.data.growth.affiliatesGrowth
        }
        setStats(combinedStats)
      } else {
        throw new Error('API response error')
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Fallback to mock data on error
      const mockStats: DashboardStats = {
        totalAffiliates: 1250,
        activeAffiliates: 890,
        totalLinks: 3420,
        activeLinks: 2890,
        totalClicks: 125000,
        totalConversions: 4200,
        totalCommissions: 125000000,
        pendingCommissions: 8500000,
        totalWithdrawals: 95000000,
        pendingWithdrawals: 12000000,
        monthlyGrowth: 15.5,
        conversionRate: 3.2
      }
      setStats(mockStats)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Tổng Affiliates',
      value: stats?.totalAffiliates.toLocaleString('vi-VN'),
      subtitle: `${stats?.activeAffiliates.toLocaleString('vi-VN')} đang hoạt động`,
      icon: Users,
      color: 'blue',
      href: '/admin/affiliate/users'
    },
    {
      title: 'Affiliate Links',
      value: stats?.totalLinks.toLocaleString('vi-VN'),
      subtitle: `${stats?.activeLinks.toLocaleString('vi-VN')} đang hoạt động`,
      icon: Link2,
      color: 'green',
      href: '/admin/affiliate/links'
    },
    {
      title: 'Tổng Hoa hồng',
      value: `${stats?.totalCommissions.toLocaleString('vi-VN')}đ`,
      subtitle: `${stats?.pendingCommissions.toLocaleString('vi-VN')}đ chờ duyệt`,
      icon: DollarSign,
      color: 'yellow',
      href: '/admin/affiliate/commissions'
    },
    {
      title: 'Rút tiền',
      value: `${stats?.totalWithdrawals.toLocaleString('vi-VN')}đ`,
      subtitle: `${stats?.pendingWithdrawals.toLocaleString('vi-VN')}đ chờ duyệt`,
      icon: FileCheck,
      color: 'purple',
      href: '/admin/affiliate/withdrawals'
    }
  ]

  const quickActions = [
    {
      title: 'Duyệt Rút tiền',
      description: 'Xem và duyệt các yêu cầu rút tiền',
      href: '/admin/affiliate/withdrawals',
      icon: FileCheck,
      urgent: true
    },
    {
      title: 'Quản lý Hoa hồng',
      description: 'Xem và quản lý hoa hồng affiliate',
      href: '/admin/affiliate/commissions',
      icon: DollarSign,
      urgent: false
    },
    {
      title: 'Báo cáo Hiệu suất',
      description: 'Xem báo cáo chi tiết về hiệu suất',
      href: '/admin/affiliate/analytics',
      icon: Activity,
      urgent: false
    },
    {
      title: 'Cài đặt Hệ thống',
      description: 'Cấu hình tỷ lệ hoa hồng và quy tắc',
      href: '/admin/affiliate/settings',
      icon: Clock,
      urgent: false
    }
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/admin" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-green-600">
              Admin
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Affiliate</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Affiliate</h1>
        <p className="text-gray-600 mt-2">
          Tổng quan và quản lý hệ thống affiliate marketing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Link key={index} href={card.href}>
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                  <card.icon className={`h-6 w-6 text-${card.color}-600`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất Tháng này</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tăng trưởng Affiliate</span>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-semibold">+{stats?.monthlyGrowth}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tỷ lệ Chuyển đổi</span>
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-blue-600 font-semibold">{stats?.conversionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động Gần đây</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">5 yêu cầu rút tiền mới</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600">12 affiliate links mới được tạo</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-gray-600">8 affiliate mới đăng ký</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác Nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className={`
                bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer
                ${action.urgent ? 'border-l-4 border-red-500' : ''}
              `}>
                <div className="flex items-center mb-3">
                  <action.icon className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="font-medium text-gray-900">{action.title}</h4>
                  {action.urgent && (
                    <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
