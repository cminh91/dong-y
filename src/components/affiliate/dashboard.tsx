"use client"

import { useState, useEffect } from "react"
import { 
  TrendingUp, MousePointer, DollarSign, Link as LinkIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DashboardData {
  user: {
    id: string
    fullName: string
    email: string
    role: string
    referralCode: string
    totalCommission: number
    availableBalance: number
    totalWithdrawn: number
    affiliateLevel: number
    createdAt: string
  }
  stats: {
    totalLinks: number
    activeLinks: number
    totalClicks: number
    totalConversions: number
    conversionRate: number
    monthlyClicks: number
    monthlyConversions: number
    monthlyCommission: number
    monthlyConversionRate: number
  }
  recentActivity: Array<{
    id: string
    ipAddress: string
    clickedAt: string
    affiliateLink: {
      title: string
      slug: string
    }
  }>
  topPerformingLinks: Array<{
    id: string
    title: string
    slug: string
    totalClicks: number
    totalConversions: number
    totalCommission: number
  }>
  chartData: Array<{
    date: string
    clicks: number
    conversions: number
    commission: number
  }>
}

export function AffiliateDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/affiliate/dashboard')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        toast.error(result.error || 'Không thể tải dữ liệu dashboard')
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      toast.error('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = () => {
    if (data?.user.referralCode) {
      navigator.clipboard.writeText(data.user.referralCode)
      toast.success('Đã sao chép mã giới thiệu!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Không thể tải dữ liệu dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Chào mừng, {data.user.fullName}!</h1>
            <p className="text-green-100">
              Cấp độ: <span className="font-semibold">Level {data.user.affiliateLevel}</span>
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-sm">Mã giới thiệu: {data.user.referralCode}</span>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={copyReferralCode}
              >
                Sao chép
              </Button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {data.user.availableBalance.toLocaleString('vi-VN')}đ
            </div>
            <div className="text-green-100">Số dư khả dụng</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Links</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalLinks}</p>
                <p className="text-xs text-green-600">
                  {data.stats.activeLinks} đang hoạt động
                </p>
              </div>
              <LinkIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalClicks}</p>
                <p className="text-xs text-blue-600">
                  {data.stats.monthlyClicks} tháng này
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalConversions}</p>
                <p className="text-xs text-purple-600">
                  {data.stats.conversionRate}% tỷ lệ chuyển đổi
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoa hồng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.user.totalCommission.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs text-yellow-600">
                  {data.stats.monthlyCommission.toLocaleString('vi-VN')}đ tháng này
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>10 clicks mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Chưa có hoạt động nào</p>
              ) : (
                data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{activity.affiliateLink.title}</p>
                      <p className="text-xs text-gray-500">IP: {activity.ipAddress}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {activity.clickedAt ?
                          new Date(activity.clickedAt).toLocaleDateString('vi-VN') :
                          'Không xác định'
                        }
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Links */}
        <Card>
          <CardHeader>
            <CardTitle>Links hiệu quả nhất</CardTitle>
            <CardDescription>Top 5 links có nhiều clicks nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topPerformingLinks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Chưa có links nào</p>
              ) : (
                data.topPerformingLinks.map((link, index) => (
                  <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{link.title}</p>
                        <p className="text-xs text-gray-500">/{link.slug}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{link.totalClicks} clicks</p>
                      <p className="text-xs text-gray-500">{link.totalConversions} conversions</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
