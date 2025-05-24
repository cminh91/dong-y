"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Search,
  UserPlus,
  Check,
  X,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { verifyUser, updateUserRole } from "@/lib/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Dữ liệu mẫu cho danh sách người dùng
const users = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0912345678",
    role: "CUSTOMER",
    status: "active",
    verified: true,
    createdAt: "2023-05-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    phone: "0923456789",
    role: "CUSTOMER",
    status: "active",
    verified: true,
    createdAt: "2023-05-16T11:30:00Z",
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "levanc@example.com",
    phone: "0934567890",
    role: "ADMIN",
    status: "active",
    verified: true,
    createdAt: "2023-05-10T09:15:00Z",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    phone: "0945678901",
    role: "CUSTOMER",
    status: "inactive",
    verified: false,
    createdAt: "2023-05-18T14:20:00Z",
  },
  {
    id: "5",
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    phone: "0956789012",
    role: "CUSTOMER",
    status: "pending",
    verified: false,
    createdAt: "2023-05-20T08:45:00Z",
  },
  {
    id: "6",
    name: "Ngô Thị F",
    email: "ngothif@example.com",
    phone: "0967890123",
    role: "AGENT",
    status: "active",
    verified: true,
    createdAt: "2023-05-12T16:30:00Z",
  },
  {
    id: "7",
    name: "Đỗ Văn G",
    email: "dovang@example.com",
    phone: "0978901234",
    role: "COLLABORATOR",
    status: "active",
    verified: true,
    createdAt: "2023-05-14T13:10:00Z",
  },
  {
    id: "8",
    name: "Lý Thị H",
    email: "lythih@example.com",
    phone: "0989012345",
    role: "STAFF",
    status: "inactive",
    verified: true,
    createdAt: "2023-05-08T10:50:00Z",
  },
  {
    id: "9",
    name: "Vũ Văn I",
    email: "vuvani@example.com",
    phone: "0990123456",
    role: "CUSTOMER",
    status: "active",
    verified: true,
    createdAt: "2023-05-19T09:30:00Z",
  },
  {
    id: "10",
    name: "Đinh Thị K",
    email: "dinhthik@example.com",
    phone: "0901234567",
    role: "CUSTOMER",
    status: "pending",
    verified: false,
    createdAt: "2023-05-21T11:20:00Z",
  },
]

export function UserManagement() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [verifiedFilter, setVerifiedFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 5

  // Lọc người dùng dựa trên các bộ lọc
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesVerified =
      verifiedFilter === "all" ||
      (verifiedFilter === "verified" && user.verified) ||
      (verifiedFilter === "unverified" && !user.verified)

    return matchesSearch && matchesStatus && matchesRole && matchesVerified
  })

  // Phân trang
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Xác nhận tài khoản người dùng
  const handleVerifyUser = async (userId: string) => {
    setIsLoading(true)
    try {
      const result = await verifyUser(userId)

      if (result.success) {
        // Cập nhật UI
        const updatedUsers = users.map((user) => (user.id === userId ? { ...user, verified: true } : user))
        // Cập nhật danh sách người dùng (trong thực tế, bạn sẽ gọi API để lấy danh sách mới)

        toast({
          title: "Thành công",
          description: "Xác nhận tài khoản thành công",
        })
      } else {
        toast({
          title: "Lỗi",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Verify user error:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xác nhận tài khoản",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cập nhật vai trò người dùng
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return

    setIsLoading(true)
    try {
      const result = await updateUserRole(selectedUser.id, newRole)

      if (result.success) {
        // Cập nhật UI
        const updatedUsers = users.map((user) => (user.id === selectedUser.id ? { ...user, role: newRole } : user))
        // Cập nhật danh sách người dùng (trong thực tế, bạn sẽ gọi API để lấy danh sách mới)

        toast({
          title: "Thành công",
          description: "Cập nhật vai trò thành công",
        })
        setIsRoleDialogOpen(false)
      } else {
        toast({
          title: "Lỗi",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Update role error:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật vai trò",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Hiển thị tên vai trò
  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên"
      case "STAFF":
        return "Nhân viên"
      case "COLLABORATOR":
        return "Cộng tác viên"
      case "AGENT":
        return "Đại lý"
      case "CUSTOMER":
        return "Khách hàng"
      default:
        return role
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h2>
          <p className="text-muted-foreground">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <Button className="bg-green-700 hover:bg-green-800">
          <UserPlus className="mr-2 h-4 w-4" /> Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>Có tổng cộng {users.length} người dùng trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Trạng thái</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                    <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Vai trò</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    <SelectItem value="STAFF">Nhân viên</SelectItem>
                    <SelectItem value="COLLABORATOR">Cộng tác viên</SelectItem>
                    <SelectItem value="AGENT">Đại lý</SelectItem>
                    <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Xác thực</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="verified">Đã xác thực</SelectItem>
                    <SelectItem value="unverified">Chưa xác thực</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Số điện thoại</TableHead>
                  <TableHead className="hidden md:table-cell">Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="hidden md:table-cell">Xác thực</TableHead>
                  <TableHead className="hidden md:table-cell">Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.phone}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>{getRoleName(user.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active"
                              ? "success"
                              : user.status === "inactive"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {user.status === "active"
                            ? "Hoạt động"
                            : user.status === "inactive"
                              ? "Không hoạt động"
                              : "Chờ xác nhận"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.verified ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Mở menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setNewRole(user.role)
                                setIsRoleDialogOpen(true)
                              }}
                            >
                              <UserCheck className="mr-2 h-4 w-4" /> Đổi vai trò
                            </DropdownMenuItem>
                            {user.status === "active" ? (
                              <DropdownMenuItem>
                                <X className="mr-2 h-4 w-4" /> Vô hiệu hóa
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <Check className="mr-2 h-4 w-4" /> Kích hoạt
                              </DropdownMenuItem>
                            )}
                            {!user.verified && (
                              <DropdownMenuItem onClick={() => handleVerifyUser(user.id)}>
                                <Check className="mr-2 h-4 w-4" /> Xác thực tài khoản
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} trên{" "}
                {filteredUsers.length} kết quả
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  Trang {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog đổi vai trò */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi vai trò người dùng</DialogTitle>
            <DialogDescription>Thay đổi vai trò cho người dùng {selectedUser?.name}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                <SelectItem value="STAFF">Nhân viên</SelectItem>
                <SelectItem value="COLLABORATOR">Cộng tác viên</SelectItem>
                <SelectItem value="AGENT">Đại lý</SelectItem>
                <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateRole} disabled={isLoading} className="bg-green-700 hover:bg-green-800">
              {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
