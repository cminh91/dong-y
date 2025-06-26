"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp, MousePointer, Target, DollarSign,
  Calendar, Filter, Download, BarChart3, Clock, Activity
} from "lucide-react"
import { toast } from "sonner"
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface PerformanceData {
  summary: {
    totalClicks: number
    totalConversions: number
    totalCommission: number
    conversionRate: number
    avgOrderValue: number
    period: number
  }
  chartData: Array<{
    date: string
    clicks: number
    conversions: number
    commission: number
  }>
  demographics: {
    countries: Array<{ country_code: string; clicks: number }>
    devices: Array<{ device_type: string; clicks: number }>
    hourlyDistribution: Array<{ hour: number; clicks: number }>
  }
  linkPerformance: Array<{
    id: string
    title: string
    slug: string
    type: string
    totalClicks: number
    totalConversions: number
    totalCommission: number
    periodClicks: number
    periodConversions: number
    periodConversionRate: number
  }>
}

export function AffiliatePerformance() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [selectedLink, setSelectedLink] = useState<string>('all')

  useEffect(() => {
    fetchPerformanceData()
  }, [period, selectedLink])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)

      // First, ensure user has affiliate links by calling the links API
      await fetch('/api/affiliate/links')

      const params = new URLSearchParams({
        period,
        ...(selectedLink !== 'all' && { linkId: selectedLink })
      })

      const response = await fetch(`/api/affiliate/performance?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        toast.error(result.error || 'Không thể tải dữ liệu thống kê')
      }
    } catch (error) {
      console.error('Error fetching performance:', error)
      toast.error('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    if (!data) return
    
    // Simple CSV export
    const csvData = [
      ['Date', 'Clicks', 'Conversions', 'Commission'],
      ...data.chartData.map(item => [
        item.date,
        item.clicks,
        item.conversions,
        item.commission
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `affiliate-performance-${period}days.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Đã xuất dữ liệu thành công!')
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
        <p className="text-gray-600">Không thể tải dữ liệu thống kê</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thống kê hiệu suất</h2>
          <p className="text-gray-600">Phân tích chi tiết hiệu suất affiliate</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày</SelectItem>
              <SelectItem value="30">30 ngày</SelectItem>
              <SelectItem value="90">90 ngày</SelectItem>
              <SelectItem value="365">1 năm</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedLink} onValueChange={setSelectedLink}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả links</SelectItem>
              {data.linkPerformance.slice(0, 10).map(link => (
                <SelectItem key={link.id} value={link.id}>
                  {link.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Xuất dữ liệu
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng Clicks</p>
                <p className="text-2xl font-bold">{data.summary.totalClicks.toLocaleString()}</p>
              </div>
              <MousePointer className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-2xl font-bold">{data.summary.totalConversions.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tỷ lệ chuyển đổi</p>
                <p className="text-2xl font-bold">{data.summary.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoa hồng</p>
                <p className="text-2xl font-bold">{data.summary.totalCommission.toLocaleString('vi-VN')}đ</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AOV</p>
                <p className="text-2xl font-bold">{data.summary.avgOrderValue.toLocaleString('vi-VN')}đ</p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Biểu đồ hiệu suất
            </CardTitle>
            <CardDescription>Clicks và conversions theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                    }}
                    formatter={(value, name) => [
                      value,
                      name === 'clicks' ? 'Clicks' :
                      name === 'conversions' ? 'Conversions' : 'Hoa hồng'
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Clicks"
                  />
                  <Area
                    type="monotone"
                    dataKey="conversions"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.8}
                    name="Conversions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Phân bố thiết bị
            </CardTitle>
            <CardDescription>Clicks theo loại thiết bị</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.demographics.devices.map((device, index) => ({
                      name: device.device_type,
                      value: device.clicks,
                      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.demographics.devices.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Clicks']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Device stats */}
            <div className="mt-4 space-y-3 pt-4 border-t">
              {data.demographics.devices.map((device, index) => {
                const total = data.demographics.devices.reduce((sum, d) => sum + d.clicks, 0)
                const percentage = total > 0 ? (device.clicks / total * 100) : 0
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500']

                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors[index % 4]}`} />
                      <span className="font-medium">{device.device_type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{device.clicks}</p>
                      <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Countries & Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
    
      </div>

      {/* Link Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất từng link</CardTitle>
          <CardDescription>Chi tiết hiệu suất của các affiliate links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Link</th>
                  <th className="text-left py-3 px-4">Loại</th>
                  <th className="text-right py-3 px-4">Clicks</th>
                  <th className="text-right py-3 px-4">Conversions</th>
                  <th className="text-right py-3 px-4">CVR</th>
                  <th className="text-right py-3 px-4">Hoa hồng</th>
                </tr>
              </thead>
              <tbody>
                {data.linkPerformance.map((link) => (
                  <tr key={link.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{link.title}</p>
                        <p className="text-sm text-gray-500">/{link.slug}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">
                        {link.type === 'PRODUCT' ? 'Sản phẩm' : 
                         link.type === 'CATEGORY' ? 'Danh mục' : 'Tổng quát'}
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div>
                        <p className="font-medium">{link.periodClicks}</p>
                        <p className="text-sm text-gray-500">({link.totalClicks} total)</p>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div>
                        <p className="font-medium">{link.totalConversions}</p>
                        <p className="text-sm text-gray-500">({link.totalConversions} total)</p>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      {(() => {
                        const totalCVR = link.totalClicks > 0 ? (link.totalConversions / link.totalClicks * 100) : 0;
                        return (
                          <span className={`font-medium ${
                            totalCVR >= 5 ? 'text-green-600' :
                            totalCVR >= 2 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {totalCVR.toFixed(2)}%
                          </span>
                        );
                      })()}
                    </td>
                    <td className="text-right py-3 px-4">
                      <p className="font-medium">{link.totalCommission.toLocaleString('vi-VN')}đ</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Phân bố theo giờ
          </CardTitle>
          <CardDescription>Clicks theo từng giờ trong ngày (0-23h)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Array.from({ length: 24 }, (_, hour) => {
                  const hourData = data.demographics.hourlyDistribution.find(h => h.hour === hour)
                  return {
                    hour: `${hour}h`,
                    clicks: hourData?.clicks || 0,
                    hourNumber: hour
                  }
                })}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11 }}
                  interval={1}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [value, 'Clicks']}
                  labelFormatter={(label) => `Giờ ${label}`}
                />
                <Bar
                  dataKey="clicks"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  name="Clicks"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats for hourly distribution */}
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600">Giờ cao điểm</p>
              <p className="text-lg font-semibold text-purple-600">
                {(() => {
                  const maxHour = data.demographics.hourlyDistribution.reduce((max, curr) =>
                    curr.clicks > max.clicks ? curr : max,
                    { hour: 0, clicks: 0 }
                  )
                  return `${maxHour.hour}:00`
                })()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Clicks cao nhất</p>
              <p className="text-lg font-semibold text-purple-600">
                {Math.max(...data.demographics.hourlyDistribution.map(h => h.clicks))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Trung bình/giờ</p>
              <p className="text-lg font-semibold text-purple-600">
                {(data.demographics.hourlyDistribution.reduce((sum, h) => sum + h.clicks, 0) / 24).toFixed(1)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
