"use client"

import { useState, useEffect } from 'react'
import {
  Search, Filter, MoreHorizontal, Eye, Edit,
  Trash2, Copy, ExternalLink, TrendingUp, Activity, Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface AffiliateLink {
  id: string
  slug: string
  type: string
  status: string
  commissionRate: number
  createdAt: string
  updatedAt: string
  expiresAt: string | null
  user: {
    id: string
    fullName: string
    email: string
    referralCode: string
  }
  product: {
    id: string
    name: string
    slug: string
    price: number
    salePrice: number | null
    images: string[]
  } | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  stats: {
    totalClicks: number
    totalConversions: number
    conversionRate: number
    totalRevenue: number
    totalCommissions: number
    recentClicks: number
  }
}

export default function AffiliateLinksPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState<AffiliateLink | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchLinks()
    fetchStats()
  }, [searchTerm, statusFilter, currentPage])

  const fetchLinks = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter
      })

      const response = await fetch(`/api/admin/affiliate/links?${params}`)
      const data = await response.json()

      if (data.success) {
        setLinks(data.data.links)
        setTotalPages(data.data.pagination.totalPages)
      } else {
        throw new Error(data.error || 'Failed to fetch links')
      }
    } catch (error) {
      console.error('Error fetching links:', error)
      // Fallback to mock data on error
      const mockLinks: AffiliateLink[] = [
        {
          id: '1',
          slug: 'yen-sao-khanh-hoa-abc123',
          type: 'PRODUCT',
          status: 'ACTIVE',
          commissionRate: 0.15,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-12-15T14:20:00Z',
          expiresAt: null,
          user: {
            id: 'user1',
            fullName: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            referralCode: 'AF001'
          },
          product: {
            id: 'prod1',
            name: 'Yến sào Khánh Hòa cao cấp',
            slug: 'yen-sao-khanh-hoa',
            price: 1500000,
            salePrice: null,
            images: []
          },
          category: null,
          stats: {
            totalClicks: 1250,
            totalConversions: 45,
            conversionRate: 3.6,
            totalRevenue: 67500000,
            totalCommissions: 2250000,
            recentClicks: 85
          }
        }
      ]
      setLinks(mockLinks)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/affiliate/links/stats')
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
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      case 'PAUSED':
        return <Badge className="bg-yellow-100 text-yellow-800">Tạm dừng</Badge>
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800">Hết hạn</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Add toast notification here
  }

  const handleViewLink = (link: AffiliateLink) => {
    setSelectedLink(link)
    setShowDetailModal(true)
  }

  // Remove client-side filtering since we're doing server-side filtering
  const filteredLinks = links

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
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan Affiliate Links</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả affiliate links trong hệ thống
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo Link Mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng Links</p>
              <p className="text-xl font-bold text-gray-900">
                {stats?.totalLinks?.toLocaleString('vi-VN') || links.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng Clicks</p>
              <p className="text-xl font-bold text-gray-900">
                {Number(stats?.totalClicks)?.toLocaleString('vi-VN') ||
                 links.reduce((sum, link) => sum + (link.stats?.totalClicks || 0), 0).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Activity className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Conversions</p>
              <p className="text-xl font-bold text-gray-900">
                {Number(stats?.totalConversions)?.toLocaleString('vi-VN') ||
                 links.reduce((sum, link) => sum + (link.stats?.totalConversions || 0), 0).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tổng Hoa hồng</p>
              <p className="text-xl font-bold text-gray-900">
                {stats?.totalCommissions?.toLocaleString('vi-VN') ||
                 links.reduce((sum, link) => sum + (link.stats?.totalCommissions || 0), 0).toLocaleString('vi-VN')}đ
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
                placeholder="Tìm kiếm theo tên link, affiliate, hoặc sản phẩm..."
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
              <SelectItem value="PAUSED">Tạm dừng</SelectItem>
              <SelectItem value="EXPIRED">Hết hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link & Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hiệu suất
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoa hồng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLinks.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {link.product?.name || link.category?.name || 'General Link'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {link.type === 'PRODUCT' ? 'Product Link' : 'Category Link'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          /aff/{link.slug}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`${window.location.origin}/aff/${link.slug}`)}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{link.user.fullName}</div>
                      <div className="text-sm text-gray-500">{link.user.email}</div>
                      <div className="text-xs text-blue-600">{link.user.referralCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>{(link.stats?.totalClicks || 0).toLocaleString('vi-VN')} clicks</div>
                      <div className="text-gray-500">{(link.stats?.totalConversions || 0)} conversions</div>
                      <div className="text-xs text-gray-400">{(link.stats?.conversionRate || 0).toFixed(1)}% tỷ lệ</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{(link.stats?.totalCommissions || 0).toLocaleString('vi-VN')}đ</div>
                      <div className="text-xs text-gray-500">{(link.commissionRate * 100).toFixed(1)}% rate</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(link.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewLink(link)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`${window.location.origin}/aff/${link.slug}`, '_blank')}
                        title="Mở link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
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
          Hiển thị {filteredLinks.length} affiliate links
        </div>
      </div>

      {/* Create Link Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Tạo Affiliate Link Mới</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">Affiliate User</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn affiliate user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user1">Nguyễn Văn A</SelectItem>
                    <SelectItem value="user2">Trần Thị B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Loại Link</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại link" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCT">Product Link</SelectItem>
                    <SelectItem value="CATEGORY">Category Link</SelectItem>
                    <SelectItem value="GENERAL">General Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="customSlug">Custom Slug (tùy chọn)</Label>
              <Input
                id="customSlug"
                placeholder="my-custom-link"
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Để trống để tự động tạo slug
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commissionRate">Tỷ lệ hoa hồng (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="15.00"
                />
              </div>
              <div>
                <Label htmlFor="expiresAt">Ngày hết hạn (tùy chọn)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Hủy
              </Button>
              <Button>
                Tạo Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Chi tiết Affiliate Link</span>
            </DialogTitle>
          </DialogHeader>

          {selectedLink && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Link URL</p>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
                          {window.location.origin}/aff/{selectedLink.slug}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(`${window.location.origin}/aff/${selectedLink.slug}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Loại</p>
                      <p className="font-medium">{selectedLink.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trạng thái</p>
                      <div>{getStatusBadge(selectedLink.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tỷ lệ hoa hồng</p>
                      <p className="font-medium">{(selectedLink.commissionRate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Affiliate User</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Họ tên</p>
                      <p className="font-medium">{selectedLink.user.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedLink.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mã giới thiệu</p>
                      <p className="font-medium text-blue-600">{selectedLink.user.referralCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product/Category Info */}
              {(selectedLink.product || selectedLink.category) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedLink.product ? 'Thông tin sản phẩm' : 'Thông tin danh mục'}
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedLink.product && (
                      <div className="space-y-2">
                        <p className="font-medium">{selectedLink.product.name}</p>
                        <p className="text-sm text-gray-600">Giá: {selectedLink.product.price.toLocaleString('vi-VN')}đ</p>
                        {selectedLink.product.salePrice && (
                          <p className="text-sm text-red-600">Giá khuyến mãi: {selectedLink.product.salePrice.toLocaleString('vi-VN')}đ</p>
                        )}
                      </div>
                    )}
                    {selectedLink.category && (
                      <div>
                        <p className="font-medium">{selectedLink.category.name}</p>
                        <p className="text-sm text-gray-600">Slug: {selectedLink.category.slug}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Performance Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê hiệu suất</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(selectedLink.stats?.totalClicks || 0).toLocaleString('vi-VN')}
                    </div>
                    <div className="text-sm text-blue-600">Tổng clicks</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedLink.stats?.totalConversions || 0}
                    </div>
                    <div className="text-sm text-green-600">Conversions</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {(selectedLink.stats?.conversionRate || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-yellow-600">Tỷ lệ chuyển đổi</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(selectedLink.stats?.totalCommissions || 0).toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-sm text-purple-600">Tổng hoa hồng</div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin thời gian</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo</p>
                    <p className="font-medium">{new Date(selectedLink.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                    <p className="font-medium">{new Date(selectedLink.updatedAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  {selectedLink.expiresAt && (
                    <div>
                      <p className="text-sm text-gray-500">Ngày hết hạn</p>
                      <p className="font-medium text-red-600">{new Date(selectedLink.expiresAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
