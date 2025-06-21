'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, Package, TrendingUp, Eye } from 'lucide-react'
import Image from 'next/image'

interface Commission {
  id: string
  amount: number
  status: string
  commissionType: 'DIRECT' | 'LEVEL'
  level: number
  orderAmount: number
  commissionRate: number
  productQuantity?: number
  productPrice?: number
  createdAt: string
  paidAt?: string
  product?: {
    id: string
    name: string
    slug: string
    images: string[]
    commissionRate: number
  }
  orderItem?: {
    id: string
    quantity: number
    price: number
  }
  affiliateLink?: {
    id: string
    title: string
    slug: string
  }
  order?: {
    id: string
    orderNumber: string
    status: string
    createdAt: string
  }
  referredUser?: {
    id: string
    fullName: string
  }
}

interface CommissionStats {
  totalCommission: number
  byStatus: Array<{
    status: string
    amount: number
    count: number
  }>
  byType: Array<{
    type: string
    amount: number
    count: number
  }>
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [stats, setStats] = useState<CommissionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCommissions()
  }, [statusFilter, typeFilter, currentPage])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('commissionType', typeFilter)

      const response = await fetch(`/api/affiliate/commissions?${params}`)
      const data = await response.json()

      if (data.success) {
        setCommissions(data.data.commissions)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching commissions:', error)
    } finally {
      setLoading(false)
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'DIRECT':
        return <Badge className="bg-blue-100 text-blue-800">Trực tiếp</Badge>
      case 'LEVEL':
        return <Badge className="bg-purple-100 text-purple-800">Cấp bậc</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const totalPending = stats?.byStatus?.find(s => s.status === 'PENDING')?.amount || 0
  const totalPaid = stats?.byStatus?.find(s => s.status === 'PAID')?.amount || 0
  const totalDirect = stats?.byType?.find(t => t.type === 'DIRECT')?.amount || 0
  const totalLevel = stats?.byType?.find(t => t.type === 'LEVEL')?.amount || 0

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hoa hồng của tôi</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Chờ duyệt</p>
                <p className="text-xl font-bold text-gray-900">{totalPending.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Đã nhận</p>
                <p className="text-xl font-bold text-gray-900">{totalPaid.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Trực tiếp</p>
                <p className="text-xl font-bold text-gray-900">{totalDirect.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Cấp bậc</p>
                <p className="text-xl font-bold text-gray-900">{totalLevel.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Loại hoa hồng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="DIRECT">Trực tiếp</SelectItem>
                <SelectItem value="LEVEL">Cấp bậc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Commissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hoa hồng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commissions.map((commission) => (
              <div key={commission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeBadge(commission.commissionType)}
                      {getStatusBadge(commission.status)}
                      <Badge variant="outline">Cấp {commission.level}</Badge>
                    </div>
                    
                    {commission.product ? (
                      <div className="flex items-center gap-3 mb-2">
                        {commission.product.images?.[0] && (
                          <Image
                            src={commission.product.images[0]}
                            alt={commission.product.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {commission.product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {commission.productQuantity}x {commission.productPrice?.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 mb-2">
                        Hoa hồng cấp bậc từ downline
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Đơn hàng: #{commission.order?.orderNumber} • 
                      Khách hàng: {commission.referredUser?.fullName} • 
                      {new Date(commission.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {commission.amount.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-sm text-gray-500">
                      {(commission.commissionRate * 100).toFixed(1)}% rate
                    </div>
                    {commission.paidAt && (
                      <div className="text-xs text-green-600">
                        Đã trả: {new Date(commission.paidAt).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {commissions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Chưa có hoa hồng nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
