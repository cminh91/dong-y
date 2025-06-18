"use client"

import { useState, useEffect } from "react"
import { 
  DollarSign, Clock, CheckCircle, XCircle, 
  Filter, Search, Calendar, TrendingUp, Download
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Commission {
  id: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'PAID'
  type: string
  createdAt: string
  approvedAt?: string
  paidAt?: string
  note?: string
  affiliateLink?: {
    title: string
    slug: string
    type: string
  }
  order?: {
    id: string
    totalAmount: number
    status: string
    createdAt: string
  }
}

interface CommissionsData {
  commissions: Commission[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  summary: {
    pending: { amount: number; count: number }
    approved: { amount: number; count: number }
    paid: { amount: number; count: number }
    total: { amount: number; available: number; withdrawn: number }
  }
  topLinks: Array<{
    id: string
    title: string
    totalCommission: number
    periodConversions: number
  }>
}

export function AffiliateCommissions() {
  const [data, setData] = useState<CommissionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([])
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [payoutNote, setPayoutNote] = useState('')

  useEffect(() => {
    fetchCommissions()
  }, [page, statusFilter])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter })
      })
      
      const response = await fetch(`/api/affiliate/commissions?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        toast.error(result.error || 'Không thể tải dữ liệu hoa hồng')
      }
    } catch (error) {
      console.error('Error fetching commissions:', error)
      toast.error('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCommission = (commissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedCommissions(prev => [...prev, commissionId])
    } else {
      setSelectedCommissions(prev => prev.filter(id => id !== commissionId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingCommissions = data?.commissions
        .filter(c => c.status === 'PENDING')
        .map(c => c.id) || []
      setSelectedCommissions(pendingCommissions)
    } else {
      setSelectedCommissions([])
    }
  }

  const requestPayout = async () => {
    if (selectedCommissions.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hoa hồng')
      return
    }

    try {
      const response = await fetch('/api/affiliate/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionIds: selectedCommissions,
          note: payoutNote
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`Đã duyệt ${result.data.processedCount} hoa hồng`)
        setShowPayoutDialog(false)
        setSelectedCommissions([])
        setPayoutNote('')
        fetchCommissions()
      } else {
        toast.error(result.error || 'Không thể xử lý yêu cầu')
      }
    } catch (error) {
      console.error('Error requesting payout:', error)
      toast.error('Lỗi kết nối server')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Chờ duyệt</Badge>
      case 'APPROVED':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Đã duyệt</Badge>
      case 'PAID':
        return <Badge variant="outline"><DollarSign className="h-3 w-3 mr-1" />Đã trả</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        <p className="text-gray-600">Không thể tải dữ liệu hoa hồng</p>
      </div>
    )
  }

  const selectedPendingCommissions = data.commissions.filter(c => 
    selectedCommissions.includes(c.id) && c.status === 'PENDING'
  )
  const selectedAmount = selectedPendingCommissions.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Hoa hồng</h2>
          <p className="text-gray-600">Theo dõi và quản lý hoa hồng từ affiliate</p>
        </div>
        {selectedCommissions.length > 0 && (
          <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
            <DialogTrigger asChild>
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Yêu cầu thanh toán ({selectedCommissions.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yêu cầu thanh toán hoa hồng</DialogTitle>
                <DialogDescription>
                  Bạn đang yêu cầu thanh toán {selectedCommissions.length} hoa hồng 
                  với tổng giá trị {selectedAmount.toLocaleString('vi-VN')}đ
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Ghi chú (tùy chọn)</Label>
                  <Textarea
                    value={payoutNote}
                    onChange={(e) => setPayoutNote(e.target.value)}
                    placeholder="Thêm ghi chú cho yêu cầu thanh toán..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={requestPayout}>
                    Xác nhận yêu cầu
                  </Button>
                  <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.summary.pending.amount.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs text-gray-500">{data.summary.pending.count} giao dịch</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.summary.approved.amount.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs text-gray-500">{data.summary.approved.count} giao dịch</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã trả</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.summary.paid.amount.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs text-gray-500">{data.summary.paid.count} giao dịch</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng hoa hồng</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.summary.total.amount.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs text-gray-500">
                  Khả dụng: {data.summary.total.available.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo link hoặc đơn hàng..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="PAID">Đã trả</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách hoa hồng</CardTitle>
              <CardDescription>
                Hiển thị {data.commissions.length} / {data.pagination.total} hoa hồng
              </CardDescription>
            </div>
            {data.commissions.some(c => c.status === 'PENDING') && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedCommissions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">Chọn tất cả</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 w-12"></th>
                  <th className="text-left py-3 px-4">Affiliate Link</th>
                  <th className="text-left py-3 px-4">Đơn hàng</th>
                  <th className="text-right py-3 px-4">Hoa hồng</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {data.commissions.map((commission) => (
                  <tr key={commission.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {commission.status === 'PENDING' && (
                        <Checkbox
                          checked={selectedCommissions.includes(commission.id)}
                          onCheckedChange={(checked) => 
                            handleSelectCommission(commission.id, checked as boolean)
                          }
                        />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {commission.affiliateLink ? (
                        <div>
                          <p className="font-medium">{commission.affiliateLink.title}</p>
                          <p className="text-sm text-gray-500">/{commission.affiliateLink.slug}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {commission.order ? (
                        <div>
                          <p className="font-medium">#{commission.order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-500">
                            {commission.order.totalAmount.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="text-right py-3 px-4">
                      <p className="font-bold text-green-600">
                        {commission.amount.toLocaleString('vi-VN')}đ
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(commission.status)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{formatDate(commission.createdAt)}</p>
                      {commission.note && (
                        <p className="text-xs text-gray-500 mt-1">{commission.note}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Trang {data.pagination.page} / {data.pagination.pages}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
