"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CreditCard,
  FileText,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: string;
  status: string;
  referralCode?: string;
  affiliateLevel: number;
  totalSales: number;
  totalCommission: number;
  availableBalance: number;
  createdAt: string;
  updatedAt: string;
  ordersCount: number;
  referralsCount: number;
}

interface IdCard {
  id: string;
  idCardNumber: string;
  frontImage: string;
  backImage: string;
  status: string; // Computed from verifiedAt/rejectedAt
  verifiedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  createdAt: string;
}

interface UserDetails extends User {
  idCards: IdCard[];
  bankAccounts: BankAccount[];
}

const getRoleColor = (role: string): string => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800";
    case "AGENT":
      return "bg-blue-100 text-blue-800";
    case "COLLABORATOR":
      return "bg-yellow-100 text-yellow-800";
    case "CUSTOMER":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "INACTIVE":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "Đang hoạt động";
    case "PENDING":
      return "Chờ duyệt";
    case "INACTIVE":
      return "Đã khóa";
    default:
      return status;
  }
};

const getRoleText = (role: string): string => {
  switch (role) {
    case "ADMIN":
      return "Quản trị viên";
    case "AGENT":
      return "Đại lý";
    case "COLLABORATOR":
      return "Cộng tác viên";
    case "CUSTOMER":
      return "Khách hàng";
    default:
      return role;
  }
};

// Component để hiển thị chi tiết user
function UserDetailsModal({ user, onClose, onStatusUpdate }: {
  user: UserDetails;
  onClose: () => void;
  onStatusUpdate: (userId: string, status: string) => void;
}) {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        onStatusUpdate(user.id, newStatus);
        onClose();
      } else {
        toast.error(data.error || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const handleIdCardVerification = async (idCardId: string, action: 'VERIFY' | 'REJECT') => {
    try {
      const response = await fetch(`/api/admin/id-cards/${idCardId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${action === 'VERIFY' ? 'Đã duyệt' : 'Đã từ chối'} CCCD thành công`);
        // Refresh user details
        window.location.reload();
      } else {
        toast.error(data.error || 'Cập nhật trạng thái CCCD thất bại');
      }
    } catch (error) {
      console.error('Error updating ID card status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái CCCD');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Chi tiết tài khoản: {user.fullName}
          </DialogTitle>
          <DialogDescription>
            Xem và duyệt thông tin tài khoản người dùng
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="idcard">CCCD/CMND</TabsTrigger>
            <TabsTrigger value="bank">Tài khoản ngân hàng</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Họ tên:</label>
                    <p className="text-sm text-gray-600">{user.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email:</label>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Số điện thoại:</label>
                    <p className="text-sm text-gray-600">{user.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Vai trò:</label>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleText(user.role)}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Địa chỉ:</label>
                    <p className="text-sm text-gray-600">{user.address}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Thống kê</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{user.ordersCount}</p>
                      <p className="text-sm text-gray-600">Đơn hàng</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{user.referralsCount}</p>
                      <p className="text-sm text-gray-600">Giới thiệu</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {user.totalSales.toLocaleString('vi-VN')}₫
                      </p>
                      <p className="text-sm text-gray-600">Doanh số</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {user.availableBalance.toLocaleString('vi-VN')}₫
                      </p>
                      <p className="text-sm text-gray-600">Số dư</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Trạng thái tài khoản</h4>
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(user.status)}>
                      {getStatusText(user.status)}
                    </Badge>
                    <div className="flex gap-2">
                      {user.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate('ACTIVE')}
                            disabled={updating}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Kích hoạt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate('INACTIVE')}
                            disabled={updating}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Từ chối
                          </Button>
                        </>
                      )}
                      {user.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate('INACTIVE')}
                          disabled={updating}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Khóa tài khoản
                        </Button>
                      )}
                      {user.status === 'INACTIVE' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate('ACTIVE')}
                          disabled={updating}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Mở khóa
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="idcard" className="space-y-4">
            {user.idCards.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Chưa có thông tin CCCD/CMND</p>
                </CardContent>
              </Card>
            ) : (
              user.idCards.map((idCard) => (
                <Card key={idCard.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        CCCD/CMND: {idCard.idCardNumber}
                      </CardTitle>
                      <Badge className={getStatusColor(idCard.status)}>
                        {idCard.status === 'PENDING' ? 'Chờ duyệt' :
                         idCard.status === 'VERIFIED' ? 'Đã duyệt' : 'Đã từ chối'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Mặt trước</h4>
                        <img
                          src={idCard.frontImage}
                          alt="CCCD mặt trước"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Mặt sau</h4>
                        <img
                          src={idCard.backImage}
                          alt="CCCD mặt sau"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                    </div>

                    {idCard.status === 'PENDING' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          onClick={() => handleIdCardVerification(idCard.id, 'VERIFY')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Duyệt CCCD
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleIdCardVerification(idCard.id, 'REJECT')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Từ chối
                        </Button>
                      </div>
                    )}

                    {idCard.status !== 'PENDING' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          onClick={() => handleIdCardVerification(idCard.id, 'VERIFY')}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={idCard.status === 'VERIFIED'}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {idCard.status === 'VERIFIED' ? 'Đã duyệt' : 'Duyệt lại'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleIdCardVerification(idCard.id, 'REJECT')}
                          disabled={idCard.status === 'REJECTED'}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {idCard.status === 'REJECTED' ? 'Đã từ chối' : 'Từ chối'}
                        </Button>
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      {idCard.verifiedAt && (
                        <div>Đã duyệt vào: {new Date(idCard.verifiedAt).toLocaleDateString('vi-VN')}</div>
                      )}
                      {idCard.rejectedAt && (
                        <div>Đã từ chối vào: {new Date(idCard.rejectedAt).toLocaleDateString('vi-VN')}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="bank" className="space-y-4">
            {user.bankAccounts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Chưa có thông tin tài khoản ngân hàng</p>
                </CardContent>
              </Card>
            ) : (
              user.bankAccounts.map((bankAccount) => (
                <Card key={bankAccount.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {bankAccount.bankName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Số tài khoản:</label>
                        <p className="text-sm text-gray-600">{bankAccount.accountNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Tên chủ tài khoản:</label>
                        <p className="text-sm text-gray-600">{bankAccount.accountName}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Chi nhánh:</label>
                        <p className="text-sm text-gray-600">{bankAccount.branch}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Đăng ký vào: {new Date(bankAccount.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, role, status, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(role !== 'all' && { role }),
        ...(status !== 'all' && { status }),
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error(data.error || 'Không thể tải danh sách người dùng');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleViewDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedUser(data.user);
      } else {
        toast.error(data.error || 'Không thể tải thông tin người dùng');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin người dùng');
    }
  };

  const handleStatusUpdate = (userId: string, newStatus: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
  };

  const pendingUsersCount = users.filter(user => user.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          {pendingUsersCount > 0 && (
            <p className="text-sm text-orange-600 mt-1">
              <Clock className="h-4 w-4 inline mr-1" />
              {pendingUsersCount} tài khoản chờ duyệt
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Link href="/admin/users/add">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <User className="h-4 w-4 mr-2" />
              Thêm người dùng
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tên, email, số điện thoại..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vai trò</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
                  <SelectItem value="COLLABORATOR">Cộng tác viên</SelectItem>
                  <SelectItem value="AGENT">Đại lý</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                  <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy người dùng
              </h3>
              <p className="text-gray-600">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <>
              {/* Table for larger screens */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người dùng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thống kê
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleText(user.role)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(user.status)}>
                            {getStatusText(user.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>{user.ordersCount} đơn hàng</div>
                            <div>{user.referralsCount} giới thiệu</div>
                            <div>{user.availableBalance.toLocaleString('vi-VN')}₫</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(user.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Chi tiết
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-4 p-4">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{user.fullName}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600">{user.phoneNumber}</p>
                        </div>
                        <Badge className={getStatusColor(user.status)}>
                          {getStatusText(user.status)}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Vai trò:</span>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleText(user.role)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Đơn hàng:</span>
                          <span>{user.ordersCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Giới thiệu:</span>
                          <span>{user.referralsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số dư:</span>
                          <span>{user.availableBalance.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ngày tạo:</span>
                          <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(user.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Trang {page} / {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}