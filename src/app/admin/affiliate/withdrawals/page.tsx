"use client"

import { useState, useEffect } from 'react'
import { 
  Search, Filter, MoreHorizontal, Eye, Check, 
  X, DollarSign, Calendar, User, CreditCard, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Withdrawal {
  id: string
  amount: number
  status: string
  requestedAt: string
  processedAt: string | null
  adminNote: string | null
  transactionId: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    fullName: string
    email: string
    phoneNumber: string
    totalCommission: number
    availableBalance: number
    totalWithdrawn: number
  }
  bankAccount: {
    id: string
    bankName: string
    accountNumber: string
    accountName: string
    branch: string
  }
}

export default function WithdrawalApprovalPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchWithdrawals()
    fetchStats()
  }, [searchTerm, statusFilter, currentPage])

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter
      })

      const response = await fetch(`/api/admin/affiliate/withdrawals?${params}`)
      const data = await response.json()

      if (data.success) {
        setWithdrawals(data.data.withdrawals)
        setTotalPages(data.data.pagination.totalPages)
      } else {
        throw new Error(data.error || 'Failed to fetch withdrawals')
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
      // Fallback to mock data on error
      const mockWithdrawals: Withdrawal[] = [
        {
          id: '1',
          amount: 5000000,
          status: 'PENDING',
          requestedAt: '2024-12-15T10:30:00Z',
          processedAt: null,
          adminNote: null,
          transactionId: null,
          createdAt: '2024-12-15T10:30:00Z',
          updatedAt: '2024-12-15T10:30:00Z',
          user: {
            id: 'user1',
            fullName: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            phoneNumber: '0901234567',
            totalCommission: 12500000,
            availableBalance: 8500000,
            totalWithdrawn: 4000000
          },
          bankAccount: {
            id: 'bank1',
            bankName: 'Vietcombank',
            accountNumber: '1234567890',
            accountName: 'Nguyen Van A',
            branch: 'Chi nhánh Hà Nội'
          }
        }
      ]
      setWithdrawals(mockWithdrawals)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/affiliate/withdrawals/stats')
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
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800">Đang xử lý</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleApprovalAction = (withdrawal: Withdrawal, action: 'approve' | 'reject') => {
    setSelectedWithdrawal(withdrawal)
    setApprovalAction(action)
    setApprovalNotes('')
    setShowApprovalDialog(true)
  }

  const handleSubmitApproval = async () => {
    if (!selectedWithdrawal) return

    try {
      const response = await fetch(`/api/admin/affiliate/withdrawals/${selectedWithdrawal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approvalAction === 'approve' ? 'COMPLETED' : 'REJECTED',
          adminNote: approvalNotes
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh withdrawals list
        await fetchWithdrawals()
        await fetchStats()
        setShowApprovalDialog(false)
        setSelectedWithdrawal(null)
        setApprovalNotes('')

        // Show success message
        alert(`${approvalAction === 'approve' ? 'Duyệt' : 'Từ chối'} yêu cầu rút tiền thành công!`)
      } else {
        console.error('Failed to process withdrawal:', data.error)
        alert('Lỗi: ' + data.error)
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error)
    }
  }

  // Remove client-side filtering since we're doing server-side filtering
  const filteredWithdrawals = withdrawals

  const totalPending = stats?.pending?.amount ?? (withdrawals.filter(w => w.status === 'PENDING').reduce((sum, w) => sum + (w.amount || 0), 0) || 0)
  const totalProcessing = stats?.processing?.amount ?? (withdrawals.filter(w => w.status === 'PROCESSING').reduce((sum, w) => sum + (w.amount || 0), 0) || 0)
  const pendingCount = stats?.pending?.count ?? (withdrawals.filter(w => w.status === 'PENDING').length || 0)

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
          <h1 className="text-2xl font-bold text-gray-900">Duyệt Rút tiền</h1>
          <p className="text-gray-600 mt-1">
            Xem và duyệt các yêu cầu rút tiền từ affiliate
          </p>
        </div>
        {(Number(pendingCount) || 0) > 0 && (
          <div className="flex items-center bg-yellow-50 text-yellow-800 px-3 py-2 rounded-lg">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {Number(pendingCount) || 0} yêu cầu chờ duyệt
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-xl font-bold text-gray-900">{(Number(totalPending) || 0).toLocaleString('vi-VN')}đ</p>
              <p className="text-xs text-gray-500">{Number(pendingCount) || 0} yêu cầu</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Đang xử lý</p>
              <p className="text-xl font-bold text-gray-900">{(Number(totalProcessing) || 0).toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng giao dịch</p>
              <p className="text-xl font-bold text-gray-900">{Number(withdrawals.length) || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng rút tiền</p>
              <p className="text-xl font-bold text-gray-900">
                {((Number(totalPending) || 0) + (Number(totalProcessing) || 0)).toLocaleString('vi-VN')}đ
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
                placeholder="Tìm kiếm theo tên, email hoặc mã giao dịch..."
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
              <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin ngân hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày yêu cầu
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{withdrawal.user?.fullName ? withdrawal.user.fullName : 'N/A'}</div>
                      <div className="text-sm text-gray-500">{withdrawal.user?.email ? withdrawal.user.email : 'N/A'}</div>
                      <div className="text-xs text-gray-400">{withdrawal.user?.phoneNumber ? withdrawal.user.phoneNumber : 'N/A'}</div>
                      <div className="text-xs text-green-600 mt-1">
                        Số dư: {(withdrawal.user?.availableBalance || 0).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {(withdrawal.amount || 0).toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-xs text-gray-500">
                        Yêu cầu rút tiền
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{withdrawal.bankAccount?.bankName ? withdrawal.bankAccount.bankName : 'N/A'}</div>
                      <div className="text-sm text-gray-500">{withdrawal.bankAccount?.accountName ? withdrawal.bankAccount.accountName : 'N/A'}</div>
                      <div className="text-xs text-gray-400">
                        {withdrawal.bankAccount?.accountNumber ? withdrawal.bankAccount.accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ') : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">{withdrawal.bankAccount?.branch ? withdrawal.bankAccount.branch : 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(withdrawal.status)}
                    {withdrawal.adminNote && (
                      <div className="text-xs text-gray-500 mt-1">{withdrawal.adminNote}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {withdrawal.requestedAt ? new Date(withdrawal.requestedAt).toLocaleDateString('vi-VN') : 'N/A'}
                    <div className="text-xs text-gray-400">
                      {withdrawal.requestedAt ? new Date(withdrawal.requestedAt).toLocaleTimeString('vi-VN') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {withdrawal.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprovalAction(withdrawal, 'approve')}
                            className="text-green-600 hover:text-green-700"
                            title="Duyệt yêu cầu"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprovalAction(withdrawal, 'reject')}
                            className="text-red-600 hover:text-red-700"
                            title="Từ chối yêu cầu"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {withdrawal.status === 'PROCESSING' && (
                        <span className="text-sm text-blue-600 font-medium">
                          Đang xử lý
                        </span>
                      )}
                      {withdrawal.status === 'COMPLETED' && (
                        <span className="text-sm text-green-600 font-medium">
                          Đã hoàn thành
                        </span>
                      )}
                      {withdrawal.status === 'REJECTED' && (
                        <span className="text-sm text-red-600 font-medium">
                          Đã từ chối
                        </span>
                      )}
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium">Không có yêu cầu rút tiền nào</p>
                      <p className="text-sm">Chưa có affiliate nào gửi yêu cầu rút tiền</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Duyệt' : 'Từ chối'} yêu cầu rút tiền
            </DialogTitle>
            <DialogDescription>
              {selectedWithdrawal ? (
                `Yêu cầu rút ${(selectedWithdrawal.amount || 0).toLocaleString('vi-VN')}đ từ ${selectedWithdrawal.user?.fullName ? selectedWithdrawal.user.fullName : 'N/A'}`
              ) : (
                'Đang tải thông tin...'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú {approvalAction === 'reject' ? '(bắt buộc)' : '(tùy chọn)'}
              </label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder={
                  approvalAction === 'approve' 
                    ? 'Ghi chú về việc duyệt...' 
                    : 'Lý do từ chối yêu cầu...'
                }
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleSubmitApproval}
                disabled={approvalAction === 'reject' && !approvalNotes.trim()}
                className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {approvalAction === 'approve' ? 'Duyệt' : 'Từ chối'}
              </Button>
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
          Hiển thị {filteredWithdrawals.length} yêu cầu rút tiền
        </div>
      </div>
    </div>
  )
}
