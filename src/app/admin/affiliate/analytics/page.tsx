"use client"

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Users, Link2, 
  DollarSign, Activity, Calendar, Download,
  BarChart3, PieChart, LineChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalyticsData {
  overview: {
    totalAffiliates: number
    activeAffiliates: number
    totalLinks: number
    totalClicks: number
    totalConversions: number
    totalCommissions: number
    conversionRate: number
    avgOrderValue: number
  }
  growth: {
    affiliatesGrowth: number
    clicksGrowth: number
    conversionsGrowth: number
    commissionsGrowth: number
  }
  topPerformers: {
    affiliates: Array<{
      id: string
      name: string
      email: string
      commissions: number
      conversions: number
    }>
    products: Array<{
      id: string
      name: string
      clicks: number
      conversions: number
      revenue: number
    }>
  }
  chartData: {
    daily: Array<{
      date: string
      clicks: number
      conversions: number
      commissions: number
    }>
    monthly: Array<{
      month: string
      affiliates: number
      revenue: number
    }>
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        timeRange
      })

      const [analyticsResponse, chartsResponse] = await Promise.all([
        fetch(`/api/admin/affiliate/analytics?${params}`),
        fetch(`/api/admin/affiliate/analytics/charts?${params}&type=daily`)
      ])

      const [analyticsData, chartsData] = await Promise.all([
        analyticsResponse.json(),
        chartsResponse.json()
      ])

      if (analyticsData.success && chartsData.success) {
        const combinedData: AnalyticsData = {
          overview: analyticsData.data.overview,
          growth: analyticsData.data.growth,
          topPerformers: analyticsData.data.topPerformers,
          chartData: {
            daily: chartsData.data.data,
            monthly: [] // Will be fetched separately if needed
          }
        }
        setData(combinedData)
      } else {
        throw new Error('Failed to fetch analytics data')
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      // Fallback to mock data on error
      const mockData: AnalyticsData = {
        overview: {
          totalAffiliates: 1250,
          activeAffiliates: 890,
          totalLinks: 3420,
          totalClicks: 125000,
          totalConversions: 4200,
          totalCommissions: 185000000,
          conversionRate: 3.36,
          avgOrderValue: 850000
        },
        growth: {
          affiliatesGrowth: 15.5,
          clicksGrowth: 23.2,
          conversionsGrowth: 18.7,
          commissionsGrowth: 28.4
        },
        topPerformers: {
          affiliates: [
            {
              id: '1',
              name: 'Nguyễn Văn A',
              email: 'nguyenvana@email.com',
              commissions: 12500000,
              conversions: 145
            }
          ],
          products: [
            {
              id: '1',
              name: 'Yến sào Khánh Hòa',
              clicks: 8500,
              conversions: 320,
              revenue: 48000000
            }
          ]
        },
        chartData: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            clicks: Math.floor(Math.random() * 1000) + 500,
            conversions: Math.floor(Math.random() * 50) + 10,
            commissions: Math.floor(Math.random() * 5000000) + 1000000
          })),
          monthly: []
        }
      }
      setData(mockData)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    // Implement export functionality
    console.log('Exporting report...')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Không có dữ liệu analytics</p>
          <p className="text-sm">Dữ liệu sẽ hiển thị khi có hoạt động affiliate</p>
        </div>
      </div>
    )
  }

  // Default empty data structure với xử lý dữ liệu từ API
  const safeData = {
    overview: {
      totalAffiliates: Number(data.overview?.totalAffiliates) || 0,
      totalClicks: Number(data.overview?.totalClicks) || 0,
      totalConversions: Number(data.overview?.totalConversions) || 0,
      totalCommissions: Number(data.overview?.totalCommissions) || 0,
      conversionRate: Number(data.overview?.conversionRate) || 0,
      avgOrderValue: Number(data.overview?.avgOrderValue) || 0,
      activeAffiliates: Number(data.overview?.activeAffiliates) || 0
    },
    growth: {
      affiliatesGrowth: Number(data.growth?.affiliatesGrowth) || 0,
      clicksGrowth: Number(data.growth?.clicksGrowth) || 0,
      conversionsGrowth: Number(data.growth?.conversionsGrowth) || 0,
      commissionsGrowth: Number(data.growth?.commissionsGrowth) || 0
    },
    topPerformers: {
      affiliates: Array.isArray(data.topPerformers?.affiliates) ? data.topPerformers.affiliates.map(affiliate => ({
        id: String(affiliate.id || ''),
        name: String(affiliate.name || 'N/A'),
        email: String(affiliate.email || 'N/A'),
        commissions: Number(affiliate.commissions) || 0,
        conversions: Number(affiliate.conversions) || 0
      })) : [],
      products: Array.isArray(data.topPerformers?.products) ? data.topPerformers.products.map(product => ({
        id: String(product.id || ''),
        name: String(product.name || 'N/A'),
        clicks: Number(product.clicks) || 0,
        conversions: Number(product.conversions) || 0,
        revenue: Number(product.revenue) || 0
      })) : []
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Phân tích</h1>
          <p className="text-gray-600 mt-1">
            Phân tích hiệu suất và xu hướng của hệ thống affiliate
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày qua</SelectItem>
              <SelectItem value="30">30 ngày qua</SelectItem>
              <SelectItem value="90">90 ngày qua</SelectItem>
              <SelectItem value="365">1 năm qua</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Tổng Affiliates</p>
                <p className="text-2xl font-bold text-gray-900">{safeData.overview.totalAffiliates.toLocaleString('vi-VN')}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{safeData.growth.affiliatesGrowth.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Tổng Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{safeData.overview.totalClicks.toLocaleString('vi-VN')}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{safeData.growth.clicksGrowth.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{safeData.overview.totalConversions.toLocaleString('vi-VN')}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{safeData.growth.conversionsGrowth.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Tổng Hoa hồng</p>
                <p className="text-2xl font-bold text-gray-900">{safeData.overview.totalCommissions.toLocaleString('vi-VN')}đ</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{safeData.growth.commissionsGrowth.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tỷ lệ Chuyển đổi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{safeData.overview.conversionRate.toFixed(2)}%</div>
            <p className="text-sm text-gray-600 mt-2">
              {safeData.overview.totalConversions} conversions từ {safeData.overview.totalClicks.toLocaleString('vi-VN')} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Giá trị Đơn hàng TB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{safeData.overview.avgOrderValue.toLocaleString('vi-VN')}đ</div>
            <p className="text-sm text-gray-600 mt-2">
              Trung bình mỗi đơn hàng qua affiliate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Affiliates Hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {((safeData.overview.activeAffiliates / (safeData.overview.totalAffiliates || 1)) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {safeData.overview.activeAffiliates} trong {safeData.overview.totalAffiliates} affiliates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Xu hướng Hiệu suất
            </CardTitle>
            <CardDescription>Clicks, conversions và hoa hồng theo ngày</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Biểu đồ xu hướng hiệu suất</p>
                <p className="text-sm">Tích hợp chart library để hiển thị</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Phân bố Doanh thu
            </CardTitle>
            <CardDescription>Doanh thu theo tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <PieChart className="h-12 w-12 mx-auto mb-2" />
                <p>Biểu đồ phân bố doanh thu</p>
                <p className="text-sm">Tích hợp chart library để hiển thị</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Affiliates</CardTitle>
            <CardDescription>Affiliates có hiệu suất cao nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeData.topPerformers.affiliates.length > 0 ? (
                safeData.topPerformers.affiliates.map((affiliate, index) => (
                  <div key={affiliate.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{affiliate.name}</div>
                        <div className="text-sm text-gray-500">{affiliate.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{affiliate.commissions.toLocaleString('vi-VN')}đ</div>
                      <div className="text-sm text-gray-500">{affiliate.conversions} conversions</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Chưa có dữ liệu affiliate</p>
                  <p className="text-sm">Dữ liệu sẽ hiển thị khi có affiliate hoạt động</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Sản phẩm</CardTitle>
            <CardDescription>Sản phẩm có hiệu suất affiliate tốt nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeData.topPerformers.products.length > 0 ? (
                safeData.topPerformers.products.map((product, index) => (
                  <div key={product.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.clicks.toLocaleString('vi-VN')} clicks</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{product.revenue.toLocaleString('vi-VN')}đ</div>
                      <div className="text-sm text-gray-500">{product.conversions} conversions</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Chưa có dữ liệu sản phẩm</p>
                  <p className="text-sm">Dữ liệu sẽ hiển thị khi có sản phẩm được bán qua affiliate</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
