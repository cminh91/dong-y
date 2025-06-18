"use client"

import { useState, useEffect } from "react"
import { 
  Plus, CreditCard, Clock, CheckCircle, XCircle, 
  AlertCircle, DollarSign, Calendar, Trash2
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Withdrawal {
  id: string
  amount: number
  fee: number
  netAmount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'
  note?: string
  requestedAt: string
  approvedAt?: string
  completedAt?: string
  rejectedAt?: string
  cancelledAt?: string
  bankAccount: {
    bankName: string
    accountNumber: string
    accountHolder: string
  }
}

interface WithdrawalsData {
  withdrawals: Withdrawal[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  balance: {
    available: number
    totalWithdrawn: number
    totalCommission: number
  }
  summary: {
    pending: { amount: number; count: number }
    approved: { amount: number; count: number }
    completed: { amount: number; count: number }
    rejected: { amount: number; count: number }
  }
}

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
  isVerified: boolean
}

export function AffiliateWithdrawals() {
  const [data, setData] = useState<WithdrawalsData | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bankAccountId: '',
    note: ''
  })

  useEffect(() => {
    fetchWithdrawals()
    fetchBankAccounts()
  }, [page, statusFilter])

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter })
      })
      
      const response = await fetch(`/api/affiliate/withdrawals?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        toast.error(result.error || 'Không thể tải dữ liệu rút tiền')
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
      toast.error('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  const fetchBankAccounts = async () => {
    try {
      const response = await fetch('/api/affiliate/settings')
      const result = await response.json()
      
      if (result.success) {
        setBankAccounts(result.data.bankAccounts || [])
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
    }
  }

  const createWithdrawal = async () => {
    const amount = parseFloat(withdrawalForm.amount)
    
    if (!amount || amount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ')
      return
    }

    if (!withdrawalForm.bankAccountId) {
      toast.error('Vui lòng chọn tài khoản ngân hàng')
      return
    }

    if (!data || amount > data.balance.available) {
      toast.error('Số dư không đủ')
      return
    }

    try {
      const response = await fetch('/api/affiliate/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          bankAccountId: withdrawalForm.bankAccountId,
          note: withdrawalForm.note
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Tạo yêu cầu rút tiền thành công!')
        setShowCreateDialog(false)
        setWithdrawalForm({ amount: '', bankAccountId: '', note: '' })
        fetchWithdrawals()
      } else {
        toast.error(result.error || 'Không thể tạo yêu cầu rút tiền')
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error)
      toast.error('Lỗi kết nối server')
    }
  }

  const cancelWithdrawal = async (withdrawalId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy yêu cầu rút tiền này?')) return

    try {
      const response = await fetch(`/api/affiliate/withdrawals?id=${withdrawalId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Đã hủy yêu cầu rút tiền')
        fetchWithdrawals()
      } else {
        toast.error(result.error || 'Không thể hủy yêu cầu')
      }
    } catch (error) {
      console.error('Error cancelling withdrawal:', error)
      toast.error('Lỗi kết nối server')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Chờ duyệt</Badge>
      case 'APPROVED':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Đã duyệt</Badge>
      case 'COMPLETED':
        return <Badge variant="outline"><DollarSign className="h-3 w-3 mr-1" />Hoàn thành</Badge>
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Từ chối</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Đã hủy</Badge>
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

  const calculateFee = (amount: number) => {
    const feeRate = 0.02 // 2%
    const minFee = 5000
    return Math.max(amount * feeRate, minFee)
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
        <p className="text-gray-600">Không thể tải dữ liệu rút tiền</p>
      </div>
    )
  }

  const withdrawalAmount = parseFloat(withdrawalForm.amount) || 0
  const estimatedFee = withdrawalAmount > 0 ? calculateFee(withdrawalAmount) : 0
  const netAmount = withdrawalAmount - estimatedFee

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Rút tiền</h2>
          <p className="text-gray-600">Tạo và theo dõi các yêu cầu rút tiền</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button disabled={data.balance.available <= 0}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo yêu cầu rút tiền
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo yêu cầu rút tiền</DialogTitle>
              <DialogDescription>
                Số dư khả dụng: {data.balance.available.toLocaleString('vi-VN')}đ
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Số tiền rút</Label>
                <Input
                  type="number"
                  placeholder="Nhập số tiền muốn rút"
                  value={withdrawalForm.amount}
                  onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  Số tiền tối thiểu: 100,000đ
                </p>
              </div>

              {withdrawalAmount > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>Số tiền rút: {withdrawalAmount.toLocaleString('vi-VN')}đ</p>
                      <p>Phí giao dịch (2%): {estimatedFee.toLocaleString('vi-VN')}đ</p>
                      <p className="font-semibold">Số tiền thực nhận: {netAmount.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Tài khoản ngân hàng</Label>
                <Select 
                  value={withdrawalForm.bankAccountId} 
                  onValueChange={(value) => setWithdrawalForm(prev => ({ ...prev, bankAccountId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.filter(acc => acc.isVerified).map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} - {account.accountNumber.slice(-4).padStart(account.accountNumber.length, '*')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {bankAccounts.filter(acc => acc.isVerified).length === 0 && (
                  <p className="text-sm text-red-600">
                    Bạn chưa có tài khoản ngân hàng đã xác thực. Vui lòng thêm tài khoản trong phần Cài đặt.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Ghi chú (tùy chọn)</Label>
                <Textarea
                  value={withdrawalForm.note}
                  onChange={(e) => setWithdrawalForm(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Thêm ghi chú cho yêu cầu rút tiền..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={createWithdrawal}
                  disabled={!withdrawalForm.amount || !withdrawalForm.bankAccountId || withdrawalAmount < 100000}
                >
                  Tạo yêu cầu
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Số dư khả dụng</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.balance.available.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.summary.pending.amount.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs text-gray-500">{data.summary.pending.count} yêu cầu</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.summary.completed.amount.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs text-gray-500">{data.summary.completed.count} giao dịch</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đã rút</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.balance.totalWithdrawn.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử rút tiền</CardTitle>
          <CardDescription>
            Hiển thị {data.withdrawals.length} / {data.pagination.total} yêu cầu rút tiền
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tài khoản ngân hàng</th>
                  <th className="text-right py-3 px-4">Số tiền</th>
                  <th className="text-right py-3 px-4">Phí</th>
                  <th className="text-right py-3 px-4">Thực nhận</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Ngày tạo</th>
                  <th className="text-left py-3 px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{withdrawal.bankAccount.bankName}</p>
                        <p className="text-sm text-gray-500">
                          {withdrawal.bankAccount.accountNumber.slice(-4).padStart(withdrawal.bankAccount.accountNumber.length, '*')}
                        </p>
                        <p className="text-sm text-gray-500">{withdrawal.bankAccount.accountHolder}</p>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <p className="font-bold">{withdrawal.amount.toLocaleString('vi-VN')}đ</p>
                    </td>
                    <td className="text-right py-3 px-4">
                      <p className="text-red-600">{withdrawal.fee.toLocaleString('vi-VN')}đ</p>
                    </td>
                    <td className="text-right py-3 px-4">
                      <p className="font-bold text-green-600">{withdrawal.netAmount.toLocaleString('vi-VN')}đ</p>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{formatDate(withdrawal.requestedAt)}</p>
                      {withdrawal.note && (
                        <p className="text-xs text-gray-500 mt-1">{withdrawal.note}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {withdrawal.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelWithdrawal(withdrawal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
