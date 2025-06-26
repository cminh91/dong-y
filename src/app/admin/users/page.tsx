"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  UserX,
  UserPlus,
  Settings,
  Shield,
  Edit,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

interface Staff {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface StaffFormData {
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  password: string;
  role: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

// Available permissions for staff
const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'dashboard.view', name: 'dashboard.view', description: 'Xem dashboard', module: 'Dashboard' },
  { id: 'users.view', name: 'users.view', description: 'Xem danh sách người dùng', module: 'Người dùng' },
  { id: 'users.edit', name: 'users.edit', description: 'Chỉnh sửa người dùng', module: 'Người dùng' },
  { id: 'users.create', name: 'users.create', description: 'Tạo người dùng mới', module: 'Người dùng' },
  { id: 'products.view', name: 'products.view', description: 'Xem sản phẩm', module: 'Sản phẩm' },
  { id: 'products.create', name: 'products.create', description: 'Tạo sản phẩm', module: 'Sản phẩm' },
  { id: 'products.edit', name: 'products.edit', description: 'Chỉnh sửa sản phẩm', module: 'Sản phẩm' },
  { id: 'products.delete', name: 'products.delete', description: 'Xóa sản phẩm', module: 'Sản phẩm' },
  { id: 'orders.view', name: 'orders.view', description: 'Xem đơn hàng', module: 'Đơn hàng' },
  { id: 'orders.edit', name: 'orders.edit', description: 'Chỉnh sửa đơn hàng', module: 'Đơn hàng' },
  { id: 'orders.delete', name: 'orders.delete', description: 'Xóa đơn hàng', module: 'Đơn hàng' },
  { id: 'categories.view', name: 'categories.view', description: 'Xem danh mục', module: 'Danh mục' },
  { id: 'categories.create', name: 'categories.create', description: 'Tạo danh mục', module: 'Danh mục' },
  { id: 'categories.edit', name: 'categories.edit', description: 'Chỉnh sửa danh mục', module: 'Danh mục' },
  { id: 'categories.delete', name: 'categories.delete', description: 'Xóa danh mục', module: 'Danh mục' },
  { id: 'posts.view', name: 'posts.view', description: 'Xem bài viết', module: 'Bài viết' },
  { id: 'posts.create', name: 'posts.create', description: 'Tạo bài viết', module: 'Bài viết' },
  { id: 'posts.edit', name: 'posts.edit', description: 'Chỉnh sửa bài viết', module: 'Bài viết' },
  { id: 'posts.delete', name: 'posts.delete', description: 'Xóa bài viết', module: 'Bài viết' },
  { id: 'affiliate.view', name: 'affiliate.view', description: 'Xem hệ thống affiliate', module: 'Affiliate' },
  { id: 'affiliate.manage', name: 'affiliate.manage', description: 'Quản lý affiliate', module: 'Affiliate' },
  { id: 'withdrawals.view', name: 'withdrawals.view', description: 'Xem yêu cầu rút tiền', module: 'Rút tiền' },
  { id: 'withdrawals.approve', name: 'withdrawals.approve', description: 'Duyệt yêu cầu rút tiền', module: 'Rút tiền' },
  { id: 'settings.view', name: 'settings.view', description: 'Xem cài đặt', module: 'Cài đặt' },
  { id: 'settings.edit', name: 'settings.edit', description: 'Chỉnh sửa cài đặt', module: 'Cài đặt' },
];

const getRoleColor = (role: string): string => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800";
    case "STAFF":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getRoleText = (role: string): string => {
  switch (role) {
    case "ADMIN":
      return "Quản trị viên";
    case "STAFF":
      return "Nhân viên";
    default:
      return role;
  }
};

// Component Để quản lý quyền của nhân viên
function StaffPermissionsModal({ staff, onClose, onUpdate }: {
  staff: Staff;
  onClose: () => void;
  onUpdate: (staffId: string, permissions: string[]) => void;
}) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(staff.permissions || []);
  const [updating, setUpdating] = useState(false);

  // Group permissions by module
  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  const handleSelectAllModule = (module: string, checked: boolean) => {
    const modulePermissions = groupedPermissions[module].map(p => p.id);
    if (checked) {
      setSelectedPermissions(prev => [...new Set([...prev, ...modulePermissions])]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => !modulePermissions.includes(id)));
    }
  };

  const handleSave = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${staff.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions: selectedPermissions }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Cập nhật quyền thành công');
        onUpdate(staff.id, selectedPermissions);
        onClose();
      } else {
        toast.error(data.error || 'Cập nhật quyền thất bại');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Có lỗi xảy ra khi cập nhật quyền');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quản lý quyền: {staff.fullName}
          </DialogTitle>
          <DialogDescription>
            Chọn các quyền mà nhân viên này có thể thực hiện trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([module, permissions]) => {
            const allSelected = permissions.every(p => selectedPermissions.includes(p.id));
            const someSelected = permissions.some(p => selectedPermissions.includes(p.id));

            return (
              <Card key={module}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{module}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor={`select-all-${module}`}
                        className="text-sm font-medium"
                      >
                        Chọn tất cả
                      </label>
                      <Checkbox
                        id={`select-all-${module}`}
                        checked={allSelected}
                        onCheckedChange={(checked) => handleSelectAllModule(module, checked as boolean)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={permission.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {permission.description}
                          </label>
                          <p className="text-xs text-gray-500 mt-1">{permission.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={updating}>
            {updating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Component để thêm/sửa nhân viên
function StaffFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editStaff 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editStaff?: Staff;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    email: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    password: '',
    role: 'STAFF',
  });

  useEffect(() => {
    if (editStaff) {
      setFormData({
        email: editStaff.email,
        fullName: editStaff.fullName,
        phoneNumber: editStaff.phoneNumber || '',
        address: editStaff.address || '',
        password: '',
        role: editStaff.role,
      });
    } else {
      // Reset form when not editing
      setFormData({
        email: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        password: '',
        role: 'STAFF',
      });
    }
  }, [editStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editStaff 
        ? `/api/admin/users/${editStaff.id}`
        : '/api/admin/users';

      const method = editStaff ? 'PUT' : 'POST';
      const successMessage = editStaff 
        ? 'Cập nhật nhân viên thành công'
        : 'Thêm nhân viên thành công';

      // Chỉ gửi password nếu có nhập mới
      const submitData = formData.password 
        ? formData 
        : { ...formData, password: undefined };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success(successMessage);
        onSuccess();
        onClose();
      } else {
        toast.error(responseData.error || 'Thao tác thất bại');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra khi thực hiện thao tác');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof StaffFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {editStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
          </DialogTitle>
          <DialogDescription>
            {editStaff 
              ? 'Chỉnh sửa thông tin tài khoản nhân viên'
              : 'Điền thông tin để tạo tài khoản nhân viên mới'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Email nhân viên"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Họ và tên</label>
            <Input
              required
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Họ và tên nhân viên"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Số điện thoại</label>
            <Input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="Số điện thoại"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Địa chỉ</label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Địa chỉ nhân viên"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {editStaff ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
            </label>
            <Input
              type="password"
              required={!editStaff}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={editStaff ? 'Nhập mật khẩu mới nếu muốn đổi' : 'Mật khẩu tài khoản'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Vai trò</label>
            <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAFF">Nhân viên</SelectItem>
                <SelectItem value="ADMIN">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} type="button">
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : (editStaff ? 'Cập nhật' : 'Thêm nhân viên')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function StaffManagementPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | undefined>();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(role !== 'all' && { role }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setStaff(data.users);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error(data.error || 'Không thể tải danh sách nhân viên');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page, role]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStaff();
  };

  const handlePermissionsUpdate = (staffId: string, permissions: string[]) => {
    setStaff(prev => prev.map(s => 
      s.id === staffId ? { ...s, permissions } : s
    ));
  };

  const handleEditStaff = (member: Staff) => {
    setEditStaff(member);
    setShowFormModal(true);
  };

  const handleAddNewStaff = () => {
    setEditStaff(undefined);
    setShowFormModal(true);
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditStaff(undefined);
    fetchStaff();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Quản lý nhân viên
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý nhân viên và phân quyền truy cập hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchStaff} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700" 
            onClick={handleAddNewStaff}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <SelectItem value="STAFF">Nhân viên</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
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

      {/* Staff List */}
      <Card>
        <CardContent className="p-0">
          {staff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy nhân viên
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
                        Nhân viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quyền hạn
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
                    {staff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.fullName}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                            <div className="text-sm text-gray-500">{member.phoneNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getRoleColor(member.role)}>
                            {getRoleText(member.role)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>{member.permissions?.length || 0} quyền</span>
                            {member.role !== 'ADMIN' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedStaff(member)}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Phân quyền
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditStaff(member)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Sửa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-4 p-4">
                {staff.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{member.fullName}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-sm text-gray-600">{member.phoneNumber}</p>
                        </div>
                        <Badge className={getRoleColor(member.role)}>
                          {getRoleText(member.role)}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Quyền hạn:</span>
                          <span>{member.permissions?.length || 0} quyền</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ngày tạo:</span>
                          <span>{new Date(member.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <div className="flex justify-end mt-4 gap-2">
                        {member.role !== 'ADMIN' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedStaff(member)}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Phân quyền
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStaff(member)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
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

      {/* Staff Permissions Modal */}
      {selectedStaff && (
        <StaffPermissionsModal
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
          onUpdate={handlePermissionsUpdate}
        />
      )}

      {/* Staff Form Modal */}
      <StaffFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditStaff(undefined);
        }}
        onSuccess={handleFormSuccess}
        editStaff={editStaff}
      />
    </div>
  );
}