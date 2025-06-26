"use client"

import { useState, useEffect } from "react"
import { Package, Calendar, Eye, Truck, RefreshCw, Search, CalendarIcon, X } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface UserPayload {
  userId: string
  email: string
  role: string
  fullName: string
}

interface OrdersTabProps {
  userPayload: UserPayload
}

interface OrderItem {
  id: string
  productName: string
  price: number
  quantity: number
  subtotal: number
}

interface Order {
  id: string
  code: string
  customerName: string
  customerPhone: string
  customerEmail: string
  shippingAddress: string
  notes: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  paymentMethod: string
  status: string
  paymentStatus: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export function OrdersTab({ userPayload }: OrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [dateFilter, setDateFilter] = useState("all") // all, today, week, month, custom

  useEffect(() => {
    fetchOrders()
  }, [])

  // Fetch orders when filters change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders()
    }, searchTerm ? 500 : 0) // Debounce search, immediate for other filters

    return () => clearTimeout(timeoutId)
  }, [statusFilter, searchTerm, dateFilter, dateFrom, dateTo])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams()

      if (statusFilter !== "all") {
        params.append('status', statusFilter)
      }

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      // Add date filters for API call
      if (dateFilter === "custom") {
        if (dateFrom) {
          params.append('dateFrom', dateFrom.toISOString())
        }
        if (dateTo) {
          params.append('dateTo', dateTo.toISOString())
        }
      }

      const url = `/api/orders/user${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
      } else {
        toast.error(data.error || 'Không thể tải danh sách đơn hàng')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Có lỗi xảy ra khi tải đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Chờ xử lý</Badge>
      case 'CONFIRMED':
        return <Badge variant="default">Đã xác nhận</Badge>
      case 'PROCESSING':
        return <Badge className="bg-purple-600">Đang xử lý</Badge>
      case 'SHIPPING':
        return <Badge className="bg-blue-600">Đang giao</Badge>
      case 'DELIVERED':
        return <Badge className="bg-green-600">Đã giao</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Đã hủy</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng'
      case 'MOMO':
        return 'Ví MoMo'
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng'
      case 'CREDIT_CARD':
        return 'Thẻ tín dụng'
      default:
        return method
    }
  }

  // Handle date filter changes
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value)
    if (value !== "custom") {
      setDateFrom(undefined)
      setDateTo(undefined)
    }
  }

  // Clear date filters
  const clearDateFilters = () => {
    setDateFilter("all")
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  // Helper function to check if date is in range
  const isDateInRange = (orderDate: string) => {
    const date = new Date(orderDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (dateFilter) {
      case "today":
        const orderDateOnly = new Date(date)
        orderDateOnly.setHours(0, 0, 0, 0)
        return orderDateOnly.getTime() === today.getTime()

      case "week":
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        return date >= weekAgo && date <= new Date()

      case "month":
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        return date >= monthAgo && date <= new Date()

      case "custom":
        if (!dateFrom && !dateTo) return true
        if (dateFrom && !dateTo) return date >= dateFrom
        if (!dateFrom && dateTo) return date <= dateTo
        if (dateFrom && dateTo) return date >= dateFrom && date <= dateTo
        return true

      default:
        return true
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesDate = isDateInRange(order.createdAt)
    return matchesSearch && matchesStatus && matchesDate
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Show order details if selected
  if (selectedOrder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Chi tiết đơn hàng</h2>
            <p className="text-gray-600">Mã đơn hàng: {selectedOrder.code}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedOrder(null)}
          >
            Quay lại
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="flex justify-between">
                <span>Phương thức thanh toán:</span>
                <span>{getPaymentMethodText(selectedOrder.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày đặt:</span>
                <span>{new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{selectedOrder.customerName}</p>
                <p className="text-gray-600">{selectedOrder.customerPhone}</p>
                <p className="text-gray-600">{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <p className="font-medium">Địa chỉ:</p>
                <p className="text-gray-600">{selectedOrder.shippingAddress}</p>
              </div>
              {selectedOrder.notes && (
                <div>
                  <p className="font-medium">Ghi chú:</p>
                  <p className="text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm đã đặt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      {item.price.toLocaleString('vi-VN')}₫ × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    {item.subtotal.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{selectedOrder.subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{selectedOrder.shippingFee.toLocaleString('vi-VN')}₫</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span className="text-green-600">
                  {selectedOrder.totalAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h2>
          <p className="text-gray-600">Theo dõi các đơn hàng của bạn</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đơn hàng</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
              <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
              <SelectItem value="SHIPPING">Đang giao</SelectItem>
              <SelectItem value="DELIVERED">Đã giao</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm theo mã đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={handleDateFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo ngày" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thời gian</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">7 ngày qua</SelectItem>
                <SelectItem value="month">30 ngày qua</SelectItem>
                <SelectItem value="custom">Tùy chọn</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(dateFilter !== "all" || searchTerm) && (
              <Button variant="outline" onClick={() => {
                setSearchTerm("")
                clearDateFilters()
              }}>
                <X className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Custom Date Range */}
          {dateFilter === "custom" && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Từ ngày</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Đến ngày</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      disabled={(date) => date > new Date() || (dateFrom ? date < dateFrom : false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {(dateFilter !== "all" || searchTerm || statusFilter !== "all") && (
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          <span>
            Hiển thị {filteredOrders.length} đơn hàng
            {dateFilter !== "all" && ` • Lọc theo: ${
              dateFilter === "today" ? "Hôm nay" :
              dateFilter === "week" ? "7 ngày qua" :
              dateFilter === "month" ? "30 ngày qua" :
              dateFilter === "custom" ? "Khoảng thời gian tùy chọn" : ""
            }`}
            {statusFilter !== "all" && ` • Trạng thái: ${statusFilter}`}
            {searchTerm && ` • Tìm kiếm: "${searchTerm}"`}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Đơn hàng #{order.code}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-1">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="font-semibold text-green-600">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(order.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Chi tiết
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Khách hàng: {order.customerName}</h4>
                <h4 className="font-medium text-sm text-gray-700">Sản phẩm:</h4>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.productName} x{item.quantity}</span>
                    <span className="font-medium">{item.subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                ))}
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between text-sm">
                <span>Phương thức thanh toán:</span>
                <span className="font-medium">{getPaymentMethodText(order.paymentMethod)}</span>
              </div>

              {order.status === 'SHIPPING' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <Truck className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Đơn hàng đang được giao đến bạn</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có đơn hàng nào
            </h3>
            <p className="text-gray-600">
              {statusFilter === "all" 
                ? "Bạn chưa có đơn hàng nào" 
                : "Không có đơn hàng nào với trạng thái này"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
