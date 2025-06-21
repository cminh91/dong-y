"use client"

import { useState, useEffect } from 'react'
import { 
  Search, Filter, MoreHorizontal, Eye, Check, 
  X, DollarSign, Calendar, User, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Commission {
  id: string
  level: number
  commissionType: 'DIRECT' | 'LEVEL'
  orderAmount: number
  commissionRate: number
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
  updatedAt: string
  // NEW: Product fields
  productQuantity?: number
  productPrice?: number
  product?: {
    id: string
    name: string
    slug: string
    images: string[]
    commissionRate: number
  } | null
  orderItem?: {
    id: string
    quantity: number
    price: number
  } | null
  affiliateLink?: {
    id: string
    title: string
    slug: string
  } | null
  user: {
    id: string
    fullName: string
    email: string
    affiliateLevel: number
  }
  order: {
    id: string
    orderNumber: string
    totalAmount: number
    status: string
    createdAt: string
  } | null
  referredUser: {
    id: string
    fullName: string
    email: string
  } | null
}

export default function CommissionManagementPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [commissionTypeFilter, setCommissionTypeFilter] = useState('all') // NEW
  const [productFilter, setProductFilter] = useState('all') // NEW
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchCommissions()
    fetchStats()
  }, [searchTerm, statusFilter, levelFilter, commissionTypeFilter, productFilter, currentPage])

  const fetchCommissions = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (levelFilter !== 'all') params.append('level', levelFilter)
      if (commissionTypeFilter !== 'all') params.append('commissionType', commissionTypeFilter)
      if (productFilter !== 'all') params.append('productId', productFilter)

      const response = await fetch(`/api/admin/commissions?${params}`)
      const data = await response.json()

      if (data.success) {
        setCommissions(data.data.commissions)
        setTotalPages(data.data.pagination.totalPages)
        setStats(data.data.stats) // NEW: Set stats from API response
      } else {
        throw new Error(data.error || 'Failed to fetch commissions')
      }
    } catch (error) {
      console.error('Error fetching commissions:', error)
      // Fallback to mock data on error
      const mockCommissions: Commission[] = [
        {
          id: '1',
          level: 1,
          orderAmount: 1500000,
          commissionRate: 0.15,
          amount: 225000,
          status: 'PENDING',
          paidAt: null,
          createdAt: '2024-12-15T10:30:00Z',
          updatedAt: '2024-12-15T10:30:00Z',
          user: {
            id: 'user1',
            fullName: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            referralCode: 'AF001',
            affiliateLevel: 1
          },
          referredUser: {
            id: 'user2',
            fullName: 'Trần Thị B',
            email: 'tranthib@email.com'
          },
          order: {
            id: 'order1',
            orderNumber: 'ORD001',
            totalAmount: 1500000,
            status: 'COMPLETED',
            createdAt: '2024-12-15T10:30:00Z'
          }
        }
      ]
      setCommissions(mockCommissions)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/affiliate/commissions/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Đã trả</Badge>
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLevelBadge = (level: number) => {
    return <Badge variant="outline">Cấp {level}</Badge>
  }

  const getCommissionTypeBadge = (type: string) => {
    switch (type) {
      case 'DIRECT':
        return <Badge className="bg-blue-100 text-blue-800">Trực tiếp</Badge>
      case 'LEVEL':
        return <Badge className="bg-purple-100 text-purple-800">Cấp bậc</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const handleApproveCommission = async (commissionId: string) => {
    try {
      const response = await fetch(`/api/admin/commissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commissionIds: [commissionId],
          status: 'PAID'
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh commissions list
        fetchCommissions()
        fetchStats()
      } else {
        console.error('Failed to approve commission:', data.error)
      }
    } catch (error) {
      console.error('Error approving commission:', error)
    }
  }

  const handleRejectCommission = async (commissionId: string) => {
    try {
      const response = await fetch(`/api/admin/commissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commissionIds: [commissionId],
          status: 'CANCELLED'
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh commissions list
        fetchCommissions()
        fetchStats()
      } else {
        console.error('Failed to reject commission:', data.error)
      }
    } catch (error) {
      console.error('Error rejecting commission:', error)
    }
  }

  // Remove client-side filtering since we're doing server-side filtering
  const filteredCommissions = commissions

  const totalPending = stats?.byStatus?.find((s: any) => s.status === 'PENDING')?.amount || 0
  const totalPaid = stats?.byStatus?.find((s: any) => s.status === 'PAID')?.amount || 0
  const totalDirect = stats?.byType?.find((t: any) => t.type === 'DIRECT')?.amount || 0
  const totalLevel = stats?.byType?.find((t: any) => t.type === 'LEVEL')?.amount || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Hoa hồng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và duyệt hoa hồng affiliate
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-xl font-bold text-gray-900">{totalPending.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Đã trả</p>
              <p className="text-xl font-bold text-gray-900">{totalPaid.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Trực tiếp</p>
              <p className="text-xl font-bold text-gray-900">{totalDirect.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Cấp bậc</p>
              <p className="text-xl font-bold text-gray-900">{totalLevel.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng cộng</p>
              <p className="text-xl font-bold text-gray-900">
                {(stats?.totalAmount || 0).toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo affiliate, khách hàng hoặc mã đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="PAID">Đã trả</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={commissionTypeFilter} onValueChange={setCommissionTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Loại hoa hồng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="DIRECT">Trực tiếp</SelectItem>
              <SelectItem value="LEVEL">Cấp bậc</SelectItem>
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Cấp độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cấp độ</SelectItem>
              <SelectItem value="1">Cấp 1</SelectItem>
              <SelectItem value="2">Cấp 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoa hồng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCommissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{commission.order?.orderNumber || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {commission.orderAmount.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="flex gap-1 mt-1">
                        {getCommissionTypeBadge(commission.commissionType)}
                        {getLevelBadge(commission.level)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{commission.user.fullName}</div>
                      <div className="text-sm text-gray-500">{commission.user.email}</div>
                      <div className="text-xs text-blue-600">Level {commission.user.affiliateLevel}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      {commission.product ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {commission.product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {commission.productQuantity}x {commission.productPrice?.toLocaleString('vi-VN')}đ
                          </div>
                          <div className="text-xs text-green-600">
                            {(commission.product.commissionRate * 100).toFixed(1)}% rate
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400">
                          Hoa hồng cấp bậc
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {commission.referredUser?.fullName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {commission.referredUser?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {commission.amount.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-xs text-gray-500">
                        {(commission.commissionRate * 100).toFixed(1)}% rate
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(commission.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(commission.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {commission.status === 'PENDING' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApproveCommission(commission.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectCommission(commission.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Trang {currentPage} trong tổng số {totalPages} trang
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-600">
          Hiển thị {filteredCommissions.length} giao dịch hoa hồng
        </div>
      </div>
    </div>
  )
}
