"use client"

import { useState, useEffect } from "react"
import { Package, Truck, CheckCircle, Clock, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Order {
  id: string
  orderNumber: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: OrderItem[]
  createdAt: string
  shippingAddress: string
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image?: string
}

interface OrderHistoryProps {
  userId: string
}

export function OrderHistory({ userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Giả lập data đơn hàng
        const mockOrders: Order[] = [
          {
            id: "1",
            orderNumber: "DH001234",
            status: "delivered",
            total: 1250000,
            items: [
              {
                id: "1",
                name: "Thuốc bổ gan Hepasaky",
                quantity: 2,
                price: 500000,
              },
              {
                id: "2", 
                name: "Viên uống tăng cường miễn dịch",
                quantity: 1,
                price: 250000,
              }
            ],
            createdAt: "2024-01-15T10:30:00Z",
            shippingAddress: "123 Đường ABC, Quận 1, TP.HCM"
          },
          {
            id: "2",
            orderNumber: "DH001235",
            status: "processing",
            total: 750000,
            items: [
              {
                id: "3",
                name: "Cao dán Lý Pasaky",
                quantity: 3,
                price: 250000,
              }
            ],
            createdAt: "2024-01-20T14:15:00Z",
            shippingAddress: "123 Đường ABC, Quận 1, TP.HCM"
          }
        ]

        setOrders(mockOrders)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [userId])

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý"
      case "processing":
        return "Đang xử lý"
      case "shipped":
        return "Đang giao"
      case "delivered":
        return "Đã giao"
      case "cancelled":
        return "Đã hủy"
      default:
        return status
    }
  }

  const getStatusVariant = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "outline"
      case "processing":
        return "default"
      case "shipped":
        return "secondary"
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng của tôi</CardTitle>
          <CardDescription>Xem lịch sử đơn hàng và trạng thái</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Bạn chưa có đơn hàng nào</p>
            <Button onClick={() => window.location.href = "/san-pham"}>
              Mua sắm ngay
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng của tôi</CardTitle>
          <CardDescription>Xem lịch sử đơn hàng và trạng thái</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
              <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
              <TabsTrigger value="shipped">Đang giao</TabsTrigger>
              <TabsTrigger value="delivered">Đã giao</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} onViewDetails={setSelectedOrder} />
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {orders.filter(order => order.status === "pending").map((order) => (
                <OrderCard key={order.id} order={order} onViewDetails={setSelectedOrder} />
              ))}
            </TabsContent>

            <TabsContent value="processing" className="space-y-4 mt-6">
              {orders.filter(order => order.status === "processing").map((order) => (
                <OrderCard key={order.id} order={order} onViewDetails={setSelectedOrder} />
              ))}
            </TabsContent>

            <TabsContent value="shipped" className="space-y-4 mt-6">
              {orders.filter(order => order.status === "shipped").map((order) => (
                <OrderCard key={order.id} order={order} onViewDetails={setSelectedOrder} />
              ))}
            </TabsContent>

            <TabsContent value="delivered" className="space-y-4 mt-6">
              {orders.filter(order => order.status === "delivered").map((order) => (
                <OrderCard key={order.id} order={order} onViewDetails={setSelectedOrder} />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  )
}

function OrderCard({ order, onViewDetails }: { order: Order; onViewDetails: (order: Order) => void }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">#{order.orderNumber}</h3>
          <Badge variant={getStatusVariant(order.status)}>
            {getStatusIcon(order.status)}
            <span className="ml-1">{getStatusText(order.status)}</span>
          </Badge>
        </div>
        <div className="text-right">
          <div className="font-medium">{order.total.toLocaleString('vi-VN')}đ</div>
          <div className="text-sm text-gray-600">{formatDate(order.createdAt)}</div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        {order.items.length} sản phẩm
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Giao đến: {order.shippingAddress}
        </div>
        <Button variant="outline" size="sm" onClick={() => onViewDetails(order)}>
          <Eye className="h-4 w-4 mr-1" />
          Xem chi tiết
        </Button>
      </div>
    </div>
  )
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chi tiết đơn hàng #{order.orderNumber}</h2>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trạng thái:</Label>
              <Badge variant={getStatusVariant(order.status)} className="ml-2">
                {getStatusIcon(order.status)}
                <span className="ml-1">{getStatusText(order.status)}</span>
              </Badge>
            </div>
            <div>
              <Label>Ngày đặt:</Label>
              <span className="ml-2">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div>
            <Label>Địa chỉ giao hàng:</Label>
            <p className="mt-1">{order.shippingAddress}</p>
          </div>

          <div>
            <Label>Sản phẩm:</Label>
            <div className="mt-2 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">Số lượng: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                    <div className="text-sm text-gray-600">{item.price.toLocaleString('vi-VN')}đ/sp</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Tổng cộng:</span>
              <span>{order.total.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStatusIcon(status: Order["status"]) {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />
    case "processing":
      return <Package className="h-4 w-4" />
    case "shipped":
      return <Truck className="h-4 w-4" />
    case "delivered":
      return <CheckCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

function getStatusText(status: Order["status"]) {
  switch (status) {
    case "pending":
      return "Chờ xử lý"
    case "processing":
      return "Đang xử lý"
    case "shipped":
      return "Đang giao"
    case "delivered":
      return "Đã giao"
    case "cancelled":
      return "Đã hủy"
    default:
      return status
  }
}

function getStatusVariant(status: Order["status"]) {
  switch (status) {
    case "pending":
      return "outline" as const
    case "processing":
      return "default" as const
    case "shipped":
      return "secondary" as const
    case "delivered":
      return "default" as const
    case "cancelled":
      return "destructive" as const
    default:
      return "outline" as const
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-gray-700">{children}</span>
}
