"use client"

import { useState, useEffect } from "react"
import { 
  Plus, Copy, Eye, Edit2, Trash2, ExternalLink, 
  TrendingUp, MousePointer, DollarSign, Calendar,
  Link as LinkIcon, Package, Folder, Globe
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AffiliateLink {
  id: string
  slug: string
  type: 'GENERAL' | 'PRODUCT' | 'CATEGORY'
  title: string
  description?: string
  status: 'ACTIVE' | 'INACTIVE'
  commissionRate: number
  totalClicks: number
  totalConversions: number
  totalCommission: number
  productId?: string
  categoryId?: string
  createdAt: string
  expiresAt?: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
}

interface Category {
  id: string
  name: string
  slug: string
}

export function AffiliateManager() {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null)
  
  const [createForm, setCreateForm] = useState({
    type: 'general' as 'product' | 'category' | 'general',
    productId: '',
    categoryId: '',
    title: '',
    description: '',
    customSlug: '',
    commissionRate: 5,
    expiresAt: ''
  })

  // Fetch data
  useEffect(() => {
    fetchAffiliateLinks()
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchAffiliateLinks = async () => {
    try {
      const response = await fetch('/api/affiliate-links')
      const data = await response.json()
      if (data.success) {
        setAffiliateLinks(data.data.affiliateLinks)
      }
    } catch (error) {
      console.error('Error fetching affiliate links:', error)
      toast.error('Không thể tải danh sách affiliate links')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100')
      const data = await response.json()
      if (data.success) {
        setProducts(data.data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=100')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleCreateLink = async () => {
    try {
      const response = await fetch('/api/affiliate-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      })

      const data = await response.json()
      if (data.success) {
        setAffiliateLinks(prev => [data.data, ...prev])
        setShowCreateForm(false)
        setCreateForm({
          type: 'general',
          productId: '',
          categoryId: '',
          title: '',
          description: '',
          customSlug: '',
          commissionRate: 5,
          expiresAt: ''
        })
        toast.success('Tạo affiliate link thành công!')
      } else {
        toast.error(data.error || 'Tạo affiliate link thất bại')
      }
    } catch (error) {
      console.error('Error creating affiliate link:', error)
      toast.error('Tạo affiliate link thất bại')
    }
  }

  const handleUpdateLink = async (slug: string, updates: any) => {
    try {
      const response = await fetch(`/api/affiliate-links/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      if (data.success) {
        setAffiliateLinks(prev => 
          prev.map(link => link.slug === slug ? data.data : link)
        )
        toast.success('Cập nhật affiliate link thành công!')
      } else {
        toast.error(data.error || 'Cập nhật affiliate link thất bại')
      }
    } catch (error) {
      console.error('Error updating affiliate link:', error)
      toast.error('Cập nhật affiliate link thất bại')
    }
  }

  const handleDeleteLink = async (slug: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa affiliate link này?')) {
      return
    }

    try {
      const response = await fetch(`/api/affiliate-links/${slug}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        setAffiliateLinks(prev => prev.filter(link => link.slug !== slug))
        toast.success('Xóa affiliate link thành công!')
      } else {
        toast.error(data.error || 'Xóa affiliate link thất bại')
      }
    } catch (error) {
      console.error('Error deleting affiliate link:', error)
      toast.error('Xóa affiliate link thất bại')
    }
  }

  const copyAffiliateLink = (slug: string) => {
    const baseUrl = window.location.origin
    const affiliateUrl = `${baseUrl}/aff/${slug}`
    
    navigator.clipboard.writeText(affiliateUrl).then(() => {
      toast.success('Đã sao chép affiliate link!')
    }).catch(() => {
      toast.error('Không thể sao chép link')
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PRODUCT':
        return <Package className="h-4 w-4" />
      case 'CATEGORY':
        return <Folder className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'PRODUCT':
        return 'Sản phẩm'
      case 'CATEGORY':
        return 'Danh mục'
      default:
        return 'Tổng quát'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const calculateConversionRate = (clicks: number, conversions: number) => {
    if (clicks === 0) return 0
    return ((conversions / clicks) * 100).toFixed(2)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Affiliate Links</h2>
          <p className="text-gray-600">Tạo và quản lý các liên kết affiliate để kiếm hoa hồng</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo Link Mới
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Links</p>
                <p className="text-2xl font-bold text-gray-900">{affiliateLinks.length}</p>
              </div>
              <LinkIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {affiliateLinks.reduce((sum, link) => sum + link.totalClicks, 0)}
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Conversions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {affiliateLinks.reduce((sum, link) => sum + link.totalConversions, 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Hoa Hồng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {affiliateLinks.reduce((sum, link) => sum + link.totalCommission, 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle>Tạo Affiliate Link Mới</CardTitle>
            <CardDescription>Điền thông tin để tạo liên kết affiliate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại Link</Label>
                <Select
                  value={createForm.type}
                  onValueChange={(value: any) => setCreateForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Tổng quát</SelectItem>
                    <SelectItem value="product">Sản phẩm cụ thể</SelectItem>
                    <SelectItem value="category">Danh mục</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createForm.type === 'product' && (
                <div className="space-y-2">
                  <Label>Sản phẩm</Label>
                  <Select
                    value={createForm.productId}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, productId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.price.toLocaleString('vi-VN')}đ
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {createForm.type === 'category' && (
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select
                    value={createForm.categoryId}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input
                value={createForm.title}
                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tiêu đề cho affiliate link"
              />
            </div>

            <div className="space-y-2">
              <Label>Mô tả (tùy chọn)</Label>
              <Textarea
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả ngắn về affiliate link"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slug tùy chỉnh (tùy chọn)</Label>
                <Input
                  value={createForm.customSlug}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, customSlug: e.target.value }))}
                  placeholder="custom-slug"
                />
              </div>

              <div className="space-y-2">
                <Label>Tỷ lệ hoa hồng (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={createForm.commissionRate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ngày hết hạn (tùy chọn)</Label>
              <Input
                type="datetime-local"
                value={createForm.expiresAt}
                onChange={(e) => setCreateForm(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={handleCreateLink}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Link
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Affiliate Links List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Affiliate Links</CardTitle>
          <CardDescription>Quản lý và theo dõi hiệu suất các affiliate links</CardDescription>
        </CardHeader>
        <CardContent>
          {affiliateLinks.length === 0 ? (
            <div className="text-center py-8">
              <LinkIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Bạn chưa có affiliate link nào</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Link Đầu Tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {affiliateLinks.map((link) => (
                <div key={link.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeIcon(link.type)}
                        <h3 className="font-semibold text-gray-900">{link.title}</h3>
                        <Badge variant={link.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {link.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeName(link.type)}
                        </Badge>
                      </div>

                      {link.description && (
                        <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                      )}

                      {link.productId && (
                        <div className="text-sm text-blue-600 mb-2">
                          Product ID: {link.productId}
                        </div>
                      )}

                      {link.categoryId && (
                        <div className="text-sm text-blue-600 mb-2">
                          Category ID: {link.categoryId}
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Tạo: {formatDate(link.createdAt)}</span>
                        {link.expiresAt && (
                          <span>Hết hạn: {formatDate(link.expiresAt)}</span>
                        )}
                        <span>Hoa hồng: {link.commissionRate}%</span>
                      </div>

                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Affiliate Link:</div>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-white px-2 py-1 rounded border flex-1">
                            {typeof window !== 'undefined' ? window.location.origin : ''}/aff/{link.slug}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyAffiliateLink(link.slug)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 text-right">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{link.totalClicks}</div>
                          <div className="text-xs text-gray-500">Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{link.totalConversions}</div>
                          <div className="text-xs text-gray-500">Conversions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {calculateConversionRate(link.totalClicks, link.totalConversions)}%
                          </div>
                          <div className="text-xs text-gray-500">CVR</div>
                        </div>
                      </div>

                      <div className="text-center mb-4">
                        <div className="text-xl font-bold text-yellow-600">
                          {link.totalCommission.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="text-xs text-gray-500">Tổng hoa hồng</div>
                      </div>

                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              const url = `${window.location.origin}/aff/${link.slug}`
                              window.open(url, '_blank')
                            }
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingLink(link)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteLink(link.slug)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}