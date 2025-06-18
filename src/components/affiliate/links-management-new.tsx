"use client"

import { useState, useEffect } from "react"
import { 
  Plus, Copy, Eye, Edit2, Trash2, ExternalLink, 
  Package, Search, Filter, BarChart3, TrendingUp
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice?: number
  imageUrl?: string
  category: {
    name: string
    slug: string
  }
  hasAffiliateLink: boolean
  affiliateLinkStatus?: string
}

interface AffiliateLink {
  id: string
  title: string
  slug: string
  status: string
  originalUrl: string
  affiliateUrl: string
  shortCode: string
  totalClicks: number
  totalConversions: number
  totalCommission: number
  conversionRate: number
  commissionRate: number
  createdAt: string
  product: {
    name: string
    slug: string
    price: number
    salePrice?: number
    images?: any[]
    category: {
      name: string
      slug: string
    }
  }
}

export function LinksManagement() {
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [commissionRate, setCommissionRate] = useState('10')

  useEffect(() => {
    fetchLinks()
  }, [searchTerm, statusFilter])

  useEffect(() => {
    if (showCreateDialog) {
      fetchProducts()
    }
  }, [showCreateDialog, productSearch])

  const fetchLinks = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`/api/affiliate/links?${params}`)
      const data = await response.json()
      if (data.success) {
        setLinks(data.data.links)
      } else {
        toast.error(data.error || 'Không thể tải danh sách links')
      }
    } catch (error) {
      console.error('Error fetching links:', error)
      toast.error('Không thể tải danh sách links')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        ...(productSearch && { search: productSearch })
      })
      
      const response = await fetch(`/api/affiliate/products?${params}`)
      const data = await response.json()
      if (data.success) {
        setProducts(data.data.products)
      } else {
        toast.error(data.error || 'Không thể tải danh sách sản phẩm')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Không thể tải danh sách sản phẩm')
    }
  }

  const handleCreateLink = async () => {
    if (!selectedProduct) {
      toast.error('Vui lòng chọn sản phẩm')
      return
    }

    try {
      const response = await fetch('/api/affiliate/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          commissionRate: parseFloat(commissionRate) / 100
        })
      })

      const data = await response.json()
      if (data.success) {
        setLinks(prev => [data.data.link, ...prev])
        setShowCreateDialog(false)
        setSelectedProduct(null)
        setCommissionRate('10')
        toast.success('Tạo affiliate link thành công!')
      } else {
        toast.error(data.error || 'Tạo affiliate link thất bại')
      }
    } catch (error) {
      console.error('Error creating link:', error)
      toast.error('Tạo affiliate link thất bại')
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/affiliate/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      const data = await response.json()
      if (data.success) {
        setLinks(prev => prev.map(link => link.id === id ? data.data.link : link))
        toast.success('Cập nhật trạng thái thành công!')
      } else {
        toast.error(data.error || 'Cập nhật thất bại')
      }
    } catch (error) {
      console.error('Error updating link:', error)
      toast.error('Cập nhật thất bại')
    }
  }

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa affiliate link này?')) return

    try {
      const response = await fetch(`/api/affiliate/links?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setLinks(prev => prev.filter(link => link.id !== id))
        toast.success('Xóa affiliate link thành công!')
      } else {
        toast.error(data.error || 'Xóa affiliate link thất bại')
      }
    } catch (error) {
      console.error('Error deleting link:', error)
      toast.error('Xóa affiliate link thất bại')
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép ${type}!`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-600">Hoạt động</Badge>
      case 'PAUSED':
        return <Badge variant="secondary">Tạm dừng</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Affiliate Links</h2>
          <p className="text-gray-600">Tạo và quản lý các liên kết affiliate cho sản phẩm</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo Link Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo Affiliate Link Mới</DialogTitle>
              <DialogDescription>
                Chọn sản phẩm để tạo affiliate link
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Product Search */}
              <div className="space-y-2">
                <Label>Tìm kiếm sản phẩm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nhập tên sản phẩm..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Product List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id
                        ? 'border-green-500 bg-green-50'
                        : product.hasAffiliateLink
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      if (!product.hasAffiliateLink) {
                        setSelectedProduct(product)
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm font-semibold text-green-600">
                            {product.salePrice ? product.salePrice.toLocaleString('vi-VN') : product.price.toLocaleString('vi-VN')}đ
                          </span>
                          {product.salePrice && (
                            <span className="text-xs text-gray-500 line-through">
                              {product.price.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                      </div>
                      {product.hasAffiliateLink && (
                        <Badge variant="secondary">Đã có link</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Commission Rate */}
              <div className="space-y-2">
                <Label>Tỷ lệ hoa hồng (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  placeholder="10"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateLink} disabled={!selectedProduct}>
                  Tạo Affiliate Link
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="PAUSED">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Links List */}
      <div className="grid gap-4">
        {links.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có affiliate link nào
              </h3>
              <p className="text-gray-600 mb-4">
                Tạo affiliate link đầu tiên để bắt đầu kiếm hoa hồng
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Link Đầu Tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          links.map((link) => (
            <Card key={link.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {link.product.images && link.product.images.length > 0 && (
                      <img
                        src={link.product.images[0]}
                        alt={link.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{link.title}</h3>
                        {getStatusBadge(link.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{link.product.category.name}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Clicks:</span>
                          <span className="ml-1 font-medium">{link.totalClicks}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Conversions:</span>
                          <span className="ml-1 font-medium">{link.totalConversions}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Tỷ lệ chuyển đổi:</span>
                          <span className="ml-1 font-medium">{link.conversionRate.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Hoa hồng:</span>
                          <span className="ml-1 font-medium text-green-600">
                            {link.totalCommission.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Affiliate URL:</span>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {link.affiliateUrl}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(link.affiliateUrl, 'affiliate link')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(link.originalUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(
                        link.id, 
                        link.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
                      )}
                    >
                      {link.status === 'ACTIVE' ? 'Tạm dừng' : 'Kích hoạt'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
