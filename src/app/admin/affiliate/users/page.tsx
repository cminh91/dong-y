"use client"

import { useState, useEffect } from 'react'
import {
  Search, Filter, MoreHorizontal, Eye, Edit,
  Ban, CheckCircle, XCircle, DollarSign, Link2, ChevronRight,
  Mail, Phone, MapPin, Calendar, TrendingUp, Activity, X, Users
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface AffiliateUser {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  status: string
  referralCode: string
  affiliateLevel: number
  totalSales: number
  totalCommission: number
  availableBalance: number
  totalWithdrawn: number
  commissionRate: number
  createdAt: string
  updatedAt: string
  stats: {
    referredCount: number
    totalCommissionPaid: number
    totalWithdrawals: number
    pendingWithdrawals: number
    totalLinks: number
  }
  bankAccount?: {
    bankName: string
    accountNumber: string
    accountName: string
  } | null
}

export default function AffiliateUsersPage() {
  const [users, setUsers] = useState<AffiliateUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<AffiliateUser | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, statusFilter, roleFilter, currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        level: roleFilter === 'all' ? 'all' : roleFilter
      })

      const response = await fetch(`/api/admin/affiliate/users?${params}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data.users)
        setTotalPages(data.data.pagination.totalPages)
      } else {
        throw new Error(data.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Fallback to mock data on error
      const mockUsers: AffiliateUser[] = [
        {
          id: '1',
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          phoneNumber: '0901234567',
          role: 'COLLABORATOR',
          status: 'ACTIVE',
          referralCode: 'AF001',
          affiliateLevel: 1,
          totalSales: 25000000,
          totalCommission: 3750000,
          availableBalance: 2500000,
          totalWithdrawn: 1250000,
          commissionRate: 0.15,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-12-15T14:20:00Z',
          stats: {
            referredCount: 12,
            totalCommissionPaid: 3750000,
            totalWithdrawals: 1250000,
            pendingWithdrawals: 0,
            totalLinks: 8
          }
        }
      ]
      setUsers(mockUsers)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      case 'INACTIVE':
        return <Badge className="bg-gray-100 text-gray-800">Không hoạt động</Badge>
      case 'SUSPENDED':
        return <Badge className="bg-red-100 text-red-800">Tạm khóa</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'COLLABORATOR':
        return <Badge variant="outline">Cộng tác viên</Badge>
      case 'AGENT':
        return <Badge className="bg-blue-100 text-blue-800">Đại lý</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return <Badge className="bg-orange-100 text-orange-800">Cấp 1</Badge>
      case 2:
        return <Badge className="bg-gray-100 text-gray-800">Cấp 2</Badge>
      case 3:
        return <Badge className="bg-yellow-100 text-yellow-800">Cấp 3</Badge>
      case 4:
        return <Badge className="bg-purple-100 text-purple-800">Cấp 4</Badge>
      default:
        return <Badge variant="outline">Cấp {level}</Badge>
    }
  }

  const handleViewUser = (user: AffiliateUser) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleEditUser = (user: AffiliateUser) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/affiliate/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh users list
        fetchUsers()
      } else {
        console.error('Failed to update user status:', data.error)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  // Remove client-side filtering since we're doing server-side filtering
  const filteredUsers = users

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

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
              <Link href="/admin/affiliate" className="ml-1 text-sm font-medium text-gray-700 hover:text-green-600 md:ml-2">
                Affiliate
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Quản lý Users</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Affiliate Users</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả người dùng affiliate trong hệ thống
          </p>
        </div>
        <Button>
          Thêm Affiliate
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
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
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
              <SelectItem value="SUSPENDED">Tạm khóa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="COLLABORATOR">Cộng tác viên</SelectItem>
              <SelectItem value="AGENT">Đại lý</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò & Cấp độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hiệu suất
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoạt động cuối
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">{user.phoneNumber}</div>
                      <div className="text-xs text-blue-600">{user.referralCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getRoleBadge(user.role)}
                      {getLevelBadge(user.affiliateLevel)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                        {user.totalCommission.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Link2 className="h-3 w-3 mr-1" />
                        {user.stats.totalLinks} links • {user.stats.referredCount} refs
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Số dư: {user.availableBalance.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewUser(user)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.status === 'ACTIVE' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateUserStatus(user.id, 'SUSPENDED')}
                          title="Tạm khóa"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateUserStatus(user.id, 'ACTIVE')}
                          title="Kích hoạt"
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
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
          Hiển thị {filteredUsers.length} affiliate users
        </div>
      </div>

      {/* User Detail Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Chi tiết Affiliate User</span>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Họ tên</p>
                        <p className="font-medium">{selectedUser.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="font-medium">{selectedUser.phoneNumber || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày tham gia</p>
                        <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin Affiliate</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Link2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Mã giới thiệu</p>
                        <p className="font-medium text-blue-600">{selectedUser.referralCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Cấp độ</p>
                        <div>{getLevelBadge(selectedUser.affiliateLevel)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Tỷ lệ hoa hồng</p>
                        <p className="font-medium">{(selectedUser.commissionRate * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Trạng thái</p>
                        <div>{getStatusBadge(selectedUser.status)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê hiệu suất</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedUser.stats.totalLinks}
                    </div>
                    <div className="text-sm text-blue-600">Tổng links</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedUser.stats.referredCount}
                    </div>
                    <div className="text-sm text-green-600">Người giới thiệu</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedUser.totalCommission.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-sm text-yellow-600">Tổng hoa hồng</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedUser.availableBalance.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-sm text-purple-600">Số dư khả dụng</div>
                  </div>
                </div>
              </div>

              {/* Bank Account Info */}
              {selectedUser.bankAccount && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản ngân hàng</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Ngân hàng</p>
                        <p className="font-medium">{selectedUser.bankAccount.bankName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Số tài khoản</p>
                        <p className="font-medium">{selectedUser.bankAccount.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tên tài khoản</p>
                        <p className="font-medium">{selectedUser.bankAccount.accountName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Chỉnh sửa Affiliate User</span>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Họ tên</Label>
                  <Input
                    id="fullName"
                    defaultValue={selectedUser.fullName}
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    defaultValue={selectedUser.phoneNumber}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select defaultValue={selectedUser.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                      <SelectItem value="SUSPENDED">Tạm khóa</SelectItem>
                      <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="commissionRate">Tỷ lệ hoa hồng (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    defaultValue={(selectedUser.commissionRate * 100).toString()}
                    placeholder="Nhập tỷ lệ hoa hồng"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Hủy
                </Button>
                <Button>
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
