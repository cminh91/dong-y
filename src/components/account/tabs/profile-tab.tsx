"use client"

import { useState, useEffect } from "react"
import { User, Edit2, Save, X, Camera } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

interface UserPayload {
  userId: string
  email: string
  role: string
  fullName: string
}

interface ProfileTabProps {
  userPayload: UserPayload
}

interface UserProfile {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  address: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
  // Affiliate fields (optional)
  referralCode?: string
  affiliateLevel?: number
  totalSales?: number
  totalCommission?: number
  availableBalance?: number
  commissionRate?: number
}

export function ProfileTab({ userPayload }: ProfileTabProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        const data = await response.json()

        if (data.success) {
          setUser(data.profile)
          setProfileForm({
            fullName: data.profile.fullName,
            phoneNumber: data.profile.phoneNumber || "",
            address: data.profile.address || "",
          })
        } else {
          throw new Error(data.error || 'Không thể tải thông tin tài khoản')
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
        toast.error(error instanceof Error ? error.message : "Không thể tải thông tin tài khoản")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userPayload])

  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.profile)
        setEditing(false)
        toast.success(data.message || "Cập nhật thông tin thành công")
      } else {
        throw new Error(data.error || 'Cập nhật thông tin thất bại')
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error(error instanceof Error ? error.message : "Cập nhật thông tin thất bại")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Không thể tải thông tin tài khoản</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h2>
        <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
            </div>
            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleUpdate}>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={user.fullName} />
                <AvatarFallback className="text-2xl bg-green-100 text-green-600 font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.fullName}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Tham gia từ {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                value={editing ? profileForm.fullName : user.fullName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                value={editing ? profileForm.phoneNumber : user.phoneNumber || ''}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                disabled={!editing}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Input
                id="role"
                value={user.role === 'COLLABORATOR' ? 'Cộng tác viên' :
                      user.role === 'AGENT' ? 'Đại lý' :
                      user.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái tài khoản</Label>
              <Input
                id="status"
                value={user.status === 'ACTIVE' ? 'Đang hoạt động' :
                      user.status === 'INACTIVE' ? 'Tạm khóa' :
                      user.status === 'PENDING' ? 'Chờ kích hoạt' : user.status}
                disabled
                className={`bg-gray-50 ${
                  user.status === 'ACTIVE' ? 'text-green-600' :
                  user.status === 'INACTIVE' ? 'text-red-600' :
                  'text-yellow-600'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Textarea
              id="address"
              value={editing ? profileForm.address : user.address || ''}
              onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
              disabled={!editing}
              placeholder="Nhập địa chỉ"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Information for COLLABORATOR and AGENT */}
      {(user.role === 'COLLABORATOR' || user.role === 'AGENT') && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin Affiliate</CardTitle>
            <CardDescription>Thông tin về hoạt động affiliate của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Mã giới thiệu</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={user.referralCode || 'Chưa có'}
                    disabled
                    className="bg-gray-50"
                  />
                  {user.referralCode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(user.referralCode!)
                        toast.success('Đã copy mã giới thiệu')
                      }}
                    >
                      Copy
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cấp độ Affiliate</Label>
                <Input
                  value={`Level ${user.affiliateLevel || 1}`}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Tỷ lệ hoa hồng</Label>
                <Input
                  value={`${((user.commissionRate || 0) * 100).toFixed(2)}%`}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Tổng doanh số</Label>
                <Input
                  value={`${(user.totalSales || 0).toLocaleString('vi-VN')}₫`}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Tổng hoa hồng</Label>
                <Input
                  value={`${(user.totalCommission || 0).toLocaleString('vi-VN')}₫`}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Số dư khả dụng</Label>
                <Input
                  value={`${(user.availableBalance || 0).toLocaleString('vi-VN')}₫`}
                  disabled
                  className="bg-green-50 text-green-700 font-semibold"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
