"use client"

import { useState, useEffect } from "react"
import { 
  Plus, Copy, Eye, Edit2, Trash2, ExternalLink, 
  Package, Folder, Globe, Search, Filter
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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

export function LinksManagement() {
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null)

  const [createForm, setCreateForm] = useState({
    type: 'GENERAL' as 'GENERAL' | 'PRODUCT' | 'CATEGORY',
    productId: '',
    categoryId: '',
    title: '',
    description: '',
    customSlug: '',
    commissionRate: 5,
    expiresAt: ''
  })

  useEffect(() => {
    fetchLinks()
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchLinks = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        status: statusFilter !== 'all' ? statusFilter : '',
        type: typeFilter !== 'all' ? typeFilter : '',
        search: searchTerm
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
      const payload = {
        title: createForm.title,
        type: createForm.type,
        productId: createForm.type === 'PRODUCT' ? createForm.productId : undefined,
        categoryId: createForm.type === 'CATEGORY' ? createForm.categoryId : undefined,
        commissionRate: createForm.commissionRate / 100 // Convert percentage to decimal
      }

      const response = await fetch('/api/affiliate/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (data.success) {
        setLinks(prev => [data.data.link, ...prev])
        setShowCreateDialog(false)
        resetCreateForm()
        toast.success('Tạo affiliate link thành công!')
      } else {
        toast.error(data.error || 'Tạo affiliate link thất bại')
      }
    } catch (error) {
      console.error('Error creating link:', error)
      toast.error('Tạo affiliate link thất bại')
    }
  }

  const handleUpdateLink = async (id: string, updates: any) => {
    try {
      const response = await fetch('/api/affiliate/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })

      const data = await response.json()
      if (data.success) {
        setLinks(prev => prev.map(link => link.id === id ? data.data.link : link))
        setEditingLink(null)
        toast.success('Cập nhật affiliate link thành công!')
      } else {
        toast.error(data.error || 'Cập nhật affiliate link thất bại')
      }
    } catch (error) {
      console.error('Error updating link:', error)
      toast.error('Cập nhật affiliate link thất bại')
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

  const copyAffiliateLink = (slug: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const affiliateUrl = `${baseUrl}/aff/${slug}`
    
    navigator.clipboard.writeText(affiliateUrl).then(() => {
      toast.success('Đã sao chép affiliate link!')
    }).catch(() => {
      toast.error('Không thể sao chép link')
    })
  }

  const resetCreateForm = () => {
    setCreateForm({
      type: 'GENERAL',
      productId: '',
      categoryId: '',
      title: '',
      description: '',
      customSlug: '',
      commissionRate: 5,
      expiresAt: ''
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PRODUCT': return <Package className="h-4 w-4" />
      case 'CATEGORY': return <Folder className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'PRODUCT': return 'Sản phẩm'
      case 'CATEGORY': return 'Danh mục'
      default: return 'Tổng quát'
    }
  }

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || link.status === statusFilter
    const matchesType = typeFilter === 'all' || link.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

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
          <p className="text-gray-600">Tạo và quản lý các liên kết affiliate</p>
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
                Điền thông tin để tạo liên kết affiliate
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="GENERAL">Tổng quát</SelectItem>
                      <SelectItem value="PRODUCT">Sản phẩm cụ thể</SelectItem>
                      <SelectItem value="CATEGORY">Danh mục</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {createForm.type === 'PRODUCT' && (
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
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {createForm.type === 'CATEGORY' && (
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleCreateLink}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Link
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề hoặc slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="GENERAL">Tổng quát</SelectItem>
                <SelectItem value="PRODUCT">Sản phẩm</SelectItem>
                <SelectItem value="CATEGORY">Danh mục</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
