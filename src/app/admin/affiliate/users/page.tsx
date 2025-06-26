"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserStatus, UserRole } from "@prisma/client";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  DollarSign,
  Link2,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Activity,
  X,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Define IdCard interface
interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface IdCard {
  id: string;
  idCardNumber: string;
  frontImage: string;
  backImage: string;
  verifiedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Define BankAccount interface
interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
}

// Define User interface
interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: UserRole;
  status: UserStatus;
  referralCode: string;
  affiliateLevel: number;
  totalSales: number;
  totalCommission: number;
  availableBalance: number;
  totalWithdrawn: number;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  bankAccounts: BankAccount[];
  idCards: IdCard[];
  withdrawals: Withdrawal[];
  stats: {
    referredCount: number;
    totalCommissionPaid: number; 
    totalWithdrawals: number;
    pendingWithdrawals: number;
    linksCount: number;
  };
}

// Helper function to get trạng thái text
const getStatusText = (status: UserStatus) => {
  switch (status) {
    case "ACTIVE":
      return "Hoạt động";
    case "INACTIVE":
      return "Không hoạt động";
    case "PENDING":
      return "Chờ duyệt";
    default:
      return status;
  }
};

// Helper function to get status color
const getStatusColor = (status: UserStatus) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "INACTIVE":
      return "bg-red-100 text-red-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AffiliateUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, statusFilter, roleFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        status: statusFilter,
        level: roleFilter === "all" ? "all" : roleFilter,
      });

      const response = await fetch(`/api/admin/affiliate/users?${params}`);
      const data = await response.json();

      if (data.success) {
        // Ensure idCards and bankAccounts are arrays
        const users = data.data.users.map((user: any) => ({
          ...user,
          idCards: user.idCards || [],
          bankAccounts: user.bankAccounts || []
        }));
        setUsers(users);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        throw new Error(data.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error((error as Error).message || "Có lỗi xảy ra khi tải dữ liệu");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">Không hoạt động</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      default:
        return <Badge variant="outline">{getStatusText(status)}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "COLLABORATOR":
        return <Badge variant="outline">Cộng tác viên</Badge>;
      case "AGENT":
        return <Badge className="bg-blue-100 text-blue-800">Đại lý</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return <Badge className="bg-orange-100 text-orange-800">Cấp 1</Badge>;
      case 2:
        return <Badge className="bg-gray-100 text-gray-800">Cấp 2</Badge>;
      case 3:
        return <Badge className="bg-yellow-100 text-yellow-800">Cấp 3</Badge>;
      case 4:
        return <Badge className="bg-purple-100 text-purple-800">Cấp 4</Badge>;
      default:
        return <Badge variant="outline">Cấp {level}</Badge>;
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: UserStatus) => {
    try {
      const response = await fetch(`/api/admin/affiliate/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Cập nhật trạng thái thành công");
        // Refresh data
        fetchUsers();
      } else {
        throw new Error(data.error || "Có lỗi xảy ra khi cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error((error as Error).message || "Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleVerifyIdCard = async (idCardId: string) => {
    try {
      const response = await fetch(
        `/api/admin/affiliate/users/idcards/${idCardId}/verify`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Đã duyệt CCCD thành công");
        fetchUsers(); // Refresh data
      } else {
        throw new Error(data.error || "Có lỗi xảy ra khi duyệt CCCD");
      }
    } catch (error) {
      console.error("Error verifying ID card:", error);
      toast.error((error as Error).message || "Có lỗi xảy ra khi duyệt CCCD");
    }
  };

  const handleRejectIdCard = async (idCardId: string) => {
    try {
      const response = await fetch(
        `/api/admin/affiliate/users/idcards/${idCardId}/reject`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Đã từ chối CCCD");
        fetchUsers(); // Refresh data
      } else {
        throw new Error(data.error || "Có lỗi xảy ra khi từ chối CCCD");
      }
    } catch (error) {
      console.error("Error rejecting ID card:", error);
      toast.error((error as Error).message || "Có lỗi xảy ra khi từ chối CCCD");
    }
  };

  // Remove client-side filtering since we're doing server-side filtering
  const filteredUsers = users;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-green-600"
            >
              Admin
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link
                href="/admin/affiliate"
                className="ml-1 text-sm font-medium text-gray-700 hover:text-green-600 md:ml-2"
              >
                Affiliate
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                Quản lý Users
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Affiliate Users
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả người dùng affiliate trong hệ thống
          </p>
        </div>
        <Button>Thêm Affiliate</Button>
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
          <Select
            value={statusFilter}
            onValueChange={(value: "all" | UserStatus) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">{getStatusText("ACTIVE")}</SelectItem>
              <SelectItem value="INACTIVE">{getStatusText("INACTIVE")}</SelectItem>
              <SelectItem value="PENDING">{getStatusText("PENDING")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "all")}>
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
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">
                        {user.phoneNumber}
                      </div>
                      <div className="text-xs text-blue-600">
                        {user.referralCode}
                      </div>
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
                        {user.totalCommission.toLocaleString("vi-VN")}đ
                      </div>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Link2 className="h-3 w-3 mr-1" />
                        {user.stats.totalLinks} links •{" "}
                        {user.stats.referredCount} refs
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Số dư: {user.availableBalance.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Badge className={getStatusColor(user.status)}>
                        {getStatusText(user.status)}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.updatedAt).toLocaleDateString("vi-VN")}
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
                      {user.status === "ACTIVE" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateUserStatus(user.id, "INACTIVE")}
                          title="Tạm khóa"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateUserStatus(user.id, "ACTIVE")}
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Thông tin cơ bản
                  </h3>
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
                        <p className="font-medium">
                          {selectedUser.phoneNumber || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Địa chỉ</p>
                        <p className="font-medium">
                          {selectedUser.address || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày tham gia</p>
                        <p className="font-medium">
                          {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Thông tin Affiliate
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Trạng thái</p>
                        <div>{getStatusBadge(selectedUser.status)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Mã giới thiệu</p>
                        <p className="font-medium text-blue-600">
                          {selectedUser.referralCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Tỷ lệ hoa hồng</p>
                        <p className="font-medium">
                          {(selectedUser.commissionRate * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thống kê hiệu suất chi tiết
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Doanh số bán hàng</h4>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {selectedUser.totalSales.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-sm text-gray-500">đ</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Tổng giá trị đơn hàng đã bán
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Hoa hồng</h4>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-green-600">
                        {selectedUser.totalCommission.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-sm text-gray-500">đ</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Tổng hoa hồng đã tạo ra
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Đã rút</h4>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-orange-600">
                        {selectedUser.totalWithdrawn.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-sm text-gray-500">đ</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Tổng số tiền đã rút
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Số dư khả dụng</h4>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {selectedUser.availableBalance.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-sm text-gray-500">đ</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Có thể rút ngay
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Người được giới thiệu</h4>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-purple-600">
                        {selectedUser.stats.referredCount}
                      </span>
                      <span className="text-sm text-gray-500">người</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Số người dùng đã giới thiệu
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Links đã tạo</h4>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-indigo-600">
                        {selectedUser.stats.totalLinks}
                      </span>
                      <span className="text-sm text-gray-500">links</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Số link affiliate đã tạo
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Chi tiết thanh toán</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hoa hồng đã thanh toán:</span>
                        <span className="font-medium">
                          {selectedUser.stats.totalCommissionPaid.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tổng tiền đã rút:</span>
                        <span className="font-medium">
                          {selectedUser.totalWithdrawn?.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Yêu cầu rút tiền đang chờ:</span>
                        <span className="font-medium">
                          {selectedUser.stats.pendingWithdrawals} yêu cầu
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Thông tin hoa hồng</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tỷ lệ hoa hồng hiện tại:</span>
                        <span className="font-medium text-green-600">
                          {(selectedUser.commissionRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cấp độ Affiliate:</span>
                        <span className="font-medium">Cấp {selectedUser.affiliateLevel}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Vai trò:</span>
                        <span className="font-medium">
                          {selectedUser.role === 'AGENT' ? 'Đại lý' : 'Cộng tác viên'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Accounts Info */}
              {selectedUser.bankAccounts?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thông tin tài khoản ngân hàng
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedUser.bankAccounts.map((bankAccount) => (
                      <div key={bankAccount.id} className="border-b last:border-0 pb-4 last:pb-0 pt-4 first:pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Ngân hàng</p>
                            <p className="font-medium">{bankAccount.bankName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Chi nhánh</p>
                            <p className="font-medium">{bankAccount.branch || "Chưa cập nhật"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Số tài khoản</p>
                            <p className="font-medium">{bankAccount.accountNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tên tài khoản</p>
                            <p className="font-medium">{bankAccount.accountName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ID Cards Info */}
              {selectedUser.idCards?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thông tin CCCD/CMND
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    {selectedUser.idCards.map((idCard) => (
                      <div key={idCard.id} className="border-b last:border-0 pb-4 last:pb-0 pt-4 first:pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Số CCCD/CMND</p>
                            <p className="font-medium">{idCard.idCardNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Trạng thái</p>
                            <div>
                              {idCard.verifiedAt ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Đã xác minh
                                </Badge>
                              ) : idCard.rejectedAt ? (
                                <Badge className="bg-red-100 text-red-800">
                                  Đã từ chối
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Chờ xác minh
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500 mb-2">Ảnh CCCD/CMND</p>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {idCard.frontImage && (
    <div>
      <p className="text-xs text-gray-500 mb-1">Mặt trước</p>
      <img
        src={idCard.frontImage}
        alt="Mặt trước CCCD/CMND"
        className="w-full h-60 object-cover rounded-lg border"
      />
    </div>
  )}
  {idCard.backImage && (
    <div>
      <p className="text-xs text-gray-500 mb-1">Mặt sau</p>
      <img
        src={idCard.backImage}
        alt="Mặt sau CCCD/CMND"
        className="w-full h-60 object-cover rounded-lg border"
      />
    </div>
  )}
</div>

                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">Thời gian cập nhật</p>
                            <p className="font-medium">
                              {new Date(idCard.updatedAt).toLocaleDateString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Withdrawal History */}
              {selectedUser.withdrawals?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Lịch sử rút tiền
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Thời gian
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Số tiền
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedUser.withdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {new Date(withdrawal.createdAt).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                              {withdrawal.amount.toLocaleString("vi-VN")}đ
                            </td>
                            <td className="px-4 py-2">
                              <Badge
                                className={
                                  withdrawal.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800"
                                    : withdrawal.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {withdrawal.status === "COMPLETED"
                                  ? "Đã thanh toán"
                                  : withdrawal.status === "PENDING"
                                  ? "Đang chờ"
                                  : "Đã hủy"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Approval Actions */}
              {selectedUser.status === "PENDING" && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Quyết định duyệt tham gia Affiliate
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Vui lòng xem xét thông tin cá nhân và quyết định cho phép người dùng tham gia chương trình Affiliate
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleUpdateUserStatus(selectedUser.id, "INACTIVE")}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Từ chối
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleUpdateUserStatus(selectedUser.id, "ACTIVE")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Phê duyệt
                      </Button>
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
                      <SelectItem value="ACTIVE">{getStatusText("ACTIVE")}</SelectItem>
                      <SelectItem value="INACTIVE">{getStatusText("INACTIVE")}</SelectItem>
                      <SelectItem value="PENDING">{getStatusText("PENDING")}</SelectItem>
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
                <Button>Lưu thay đổi</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
