"use client"

import { useState, useEffect } from "react"
import { 
  User, Settings, CreditCard, Bell, Lock, Edit2, Save, X, Camera, LogOut, 
  Share2, Copy, QrCode, RefreshCw, TrendingUp, Users, Wallet, 
  Gift, Star, Shield, Calendar, Phone, MapPin, Mail, Camera as CameraIcon,
  Plus, Download, Eye, EyeOff
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { logoutAction } from "@/lib/auth-actions"
import { PasswordChangeForm } from "./password-change-form"
import { ReferralCard } from "./referral-card"
import { OrderHistory } from "./order-history"
import { AffiliateDashboard } from "../affiliate/dashboard"
import { LinksManagement } from "../affiliate/links-management"
import { AffiliatePerformance } from "../affiliate/performance"
import { AffiliateCommissions } from "../affiliate/commissions"
import { AffiliateWithdrawals } from "../affiliate/withdrawals"
import { AffiliateReferrals } from "../affiliate/referrals"

interface UserPayload {
  userId: string
  email: string
  role: string
  fullName: string
  iat: number
  exp: number
}

interface UserProfile {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  address?: string
  avatarUrl?: string
  role: string
  idCardNumber?: string
  bankName?: string
  accountNumber?: string
  branch?: string
  accountName?: string
  referralCode?: string
  totalReferrals?: number
  totalCommission?: number
  isVerified: boolean
  createdAt: string
}

interface AccountPageProps {
  userPayload: UserPayload
}

export function AccountPage({ userPayload }: AccountPageProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [generatingReferral, setGeneratingReferral] = useState(false)
  const [showReferralCode, setShowReferralCode] = useState(false)
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Giả lập data - trong thực tế sẽ call API
        const mockUser: UserProfile = {
          id: userPayload.userId,
          fullName: userPayload.fullName || 'Người dùng',
          email: userPayload.email,
          phoneNumber: "0912345678",
          address: "123 Đường ABC, Quận 1, TP.HCM",
          avatarUrl: "",
          role: userPayload.role,
          idCardNumber: "079123456789",
          bankName: "VIETCOMBANK",
          accountNumber: "1234567890",
          branch: "Chi nhánh Quận 1",
          accountName: "NGUYEN VAN A",
          referralCode: "REF123456",
          totalReferrals: 5,
          totalCommission: 2500000,
          isVerified: true,
          createdAt: new Date().toISOString(),
        }

        setUser(mockUser)
        setProfileForm({
          fullName: mockUser.fullName,
          phoneNumber: mockUser.phoneNumber || "",
          address: mockUser.address || "",
        })
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
        toast.error("Không thể tải thông tin tài khoản")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userPayload])

  const handleProfileUpdate = async () => {
    try {
      // Call API to update profile
      // const response = await updateUserProfile(profileForm)
      
      // Giả lập update thành công
      if (user) {
        setUser({
          ...user,
          fullName: profileForm.fullName,
          phoneNumber: profileForm.phoneNumber,
          address: profileForm.address,
        })
      }
      
      setEditingProfile(false)
      toast.success("Cập nhật thông tin thành công")
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Cập nhật thông tin thất bại")
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    try {
      // Call API to update password
      // const response = await updateUserPassword(passwordForm)
      
      setEditingPassword(false)
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      toast.success("Đổi mật khẩu thành công")
    } catch (error) {
      console.error("Failed to update password:", error)
      toast.error("Đổi mật khẩu thất bại")
    }
  }
  const handleLogout = async () => {
    try {
      await logoutAction()
      toast.success("Đăng xuất thành công")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Đăng xuất thất bại")
    }
  }

  const generateNewReferralCode = async () => {
    if (!user) return
    
    setGeneratingReferral(true)
    try {
      // Simulate API call - in reality would call backend
      const timestamp = Date.now().toString().slice(-4)
      const nameInitials = user.fullName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3)
      
      const newCode = `${nameInitials}${timestamp}`
      
      // Update user with new referral code
      setUser({
        ...user,
        referralCode: newCode
      })
      
      toast.success("Tạo mã giới thiệu mới thành công!")
    } catch (error) {
      console.error("Failed to generate referral code:", error)
      toast.error("Không thể tạo mã giới thiệu mới")
    } finally {
      setGeneratingReferral(false)
    }
  }

  const copyReferralCode = async () => {
    if (!user?.referralCode) return
    
    try {
      await navigator.clipboard.writeText(user.referralCode)
      toast.success("Đã sao chép mã giới thiệu!")
    } catch (error) {
      toast.error("Không thể sao chép mã giới thiệu")
    }
  }

  const shareReferralLink = async () => {
    if (!user?.referralCode) return
    
    const referralLink = `${window.location.origin}/dang-ky?ref=${user.referralCode}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tham gia Đông Y Pharmacy',
          text: 'Sử dụng mã giới thiệu của tôi để đăng ký và nhận ưu đãi đặc biệt!',
          url: referralLink
        })
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(referralLink)
        toast.success("Đã sao chép link giới thiệu!")
      }
    } else {
      await navigator.clipboard.writeText(referralLink)
      toast.success("Đã sao chép link giới thiệu!")
    }
  }

  const generateQRCode = async () => {
    if (!user?.referralCode) return
    
    try {
      const referralLink = `${window.location.origin}/dang-ky?ref=${user.referralCode}`
      
      // In a real implementation, you would use a QR code library like 'qrcode'
      // For now, we'll simulate the generation and show a success message
      toast.success("QR Code đã được tạo! (Chức năng sẽ được hoàn thiện)")
      
      // You could open a modal here showing the QR code
      // or download it as an image
    } catch (error) {
      toast.error("Không thể tạo QR Code")
    }
  }

  const downloadReport = async () => {
    try {
      // Simulate report generation
      toast.success("Báo cáo đang được tạo và sẽ được gửi qua email!")
    } catch (error) {
      toast.error("Không thể tải báo cáo")
    }
  }

  const viewStatistics = () => {
    // Navigate to statistics page or open modal
    toast.info("Chức năng thống kê chi tiết sẽ được cập nhật soon!")
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN": return "Quản trị viên"
      case "STAFF": return "Nhân viên"
      case "COLLABORATOR": return "Cộng tác viên"
      case "AGENT": return "Đại lý"
      case "CUSTOMER": return "Khách hàng"
      default: return role
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN": return "default"
      case "STAFF": return "secondary"
      case "COLLABORATOR": return "outline"
      case "AGENT": return "destructive"
      default: return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Không thể tải thông tin tài khoản</p>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Modern Header with Gradient */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 rounded-3xl shadow-xl p-8 mb-8 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                {/* Avatar with Upload */}
                <div className="relative group">
                  <Avatar className="h-24 w-24 ring-4 ring-white/30 shadow-2xl">
                    <AvatarImage src={user.avatarUrl} alt={user.fullName || 'User'} />
                    <AvatarFallback className="text-2xl bg-white text-green-600 font-bold">
                      {user.fullName && user.fullName.length > 0 ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <CameraIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2">{user.fullName || 'Người dùng'}</h1>
                  <p className="text-green-100 mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleName(user.role)}
                    </Badge>
                    {user.isVerified && (
                      <Badge variant="secondary" className="bg-emerald-500/30 text-white border-emerald-300/50">
                        <Star className="h-3 w-3 mr-1" />
                        Đã xác thực
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-blue-500/30 text-white border-blue-300/50">
                      <Calendar className="h-3 w-3 mr-1" />
                      Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="secondary" 
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
                  onClick={() => setEditingProfile(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Chỉnh sửa hồ sơ
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="bg-red-500/20 text-white border-red-300/50 hover:bg-red-500/30"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </div>        {/* Enhanced Stats Cards (for COLLABORATOR and AGENT) */}
        {(user.role === "COLLABORATOR" || user.role === "AGENT") && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {/* Referral Stats */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Tổng giới thiệu</p>
                    <p className="text-3xl font-bold text-blue-700">{user.totalReferrals || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Stats */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Tổng hoa hồng</p>
                    <p className="text-3xl font-bold text-green-700">
                      {(user.totalCommission || 0).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Wallet className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Performance */}
            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Doanh số tháng</p>
                    <p className="text-3xl font-bold text-purple-700">5.2M</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Phần thưởng</p>
                    <p className="text-3xl font-bold text-orange-700">15</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Gift className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Referral Management Card */}
        {(user.role === "COLLABORATOR" || user.role === "AGENT") && (
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-xl mb-8">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-indigo-800 flex items-center gap-2">
                    <Share2 className="h-6 w-6" />
                    Hệ thống giới thiệu
                  </CardTitle>
                  <CardDescription className="text-indigo-600">
                    Quản lý mã giới thiệu và theo dõi hiệu suất
                  </CardDescription>
                </div>
                <Button 
                  onClick={generateNewReferralCode}
                  disabled={generatingReferral}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {generatingReferral ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Tạo mã mới
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Referral Code */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium text-gray-700">Mã giới thiệu hiện tại</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReferralCode(!showReferralCode)}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    {showReferralCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Input 
                    value={showReferralCode ? (user.referralCode || "Chưa có mã") : "••••••••"}
                    readOnly
                    className="font-mono text-lg text-center bg-gray-50 border-2 border-indigo-200 focus:border-indigo-400"
                  />
                  <Button onClick={copyReferralCode} variant="outline" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={shareReferralLink} className="bg-indigo-600 hover:bg-indigo-700">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Referral Performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{user.totalReferrals || 0}</p>
                    <p className="text-sm text-gray-600">Người đã giới thiệu</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {((user.totalCommission || 0) / 1000).toFixed(0)}K
                    </p>
                    <p className="text-sm text-gray-600">Tổng hoa hồng (VND)</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">4.8</p>
                    <p className="text-sm text-gray-600">Đánh giá trung bình</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50" onClick={generateQRCode}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Tạo QR Code
                </Button>
                <Button variant="outline" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50" onClick={downloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Tải báo cáo
                </Button>
                <Button variant="outline" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50" onClick={viewStatistics}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Xem thống kê
                </Button>
              </div>
            </CardContent>
          </Card>        )}

        {/* Modern Tabs Redesign */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <Tabs
            defaultValue={
              (user.role === "COLLABORATOR" || user.role === "AGENT")
                ? "affiliate-dashboard"
                : "profile"
            }
            className="w-full"
          >
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-1 rounded-t-xl">
              {/* Basic Tabs for all users */}
              <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1 mb-4">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 transition-all duration-300 rounded-lg"
                >
                  <User className="h-4 w-4 mr-2" />
                  Hồ sơ
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 transition-all duration-300 rounded-lg"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Bảo mật
                </TabsTrigger>
                <TabsTrigger
                  value="bank"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 transition-all duration-300 rounded-lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Ngân hàng
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 transition-all duration-300 rounded-lg"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Đơn hàng
                </TabsTrigger>
              </TabsList>

              {/* Affiliate Tabs for COLLABORATOR/AGENT */}
              {(user.role === "COLLABORATOR" || user.role === "AGENT") && (
                <TabsList className="grid w-full grid-cols-7 bg-transparent gap-1">
                  <TabsTrigger
                    value="affiliate-dashboard"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 transition-all duration-300 rounded-lg"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger
                    value="affiliate-links"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 transition-all duration-300 rounded-lg"
                  >
                    Links
                  </TabsTrigger>
                  <TabsTrigger
                    value="affiliate-performance"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 transition-all duration-300 rounded-lg"
                  >
                    Thống kê
                  </TabsTrigger>
                  <TabsTrigger
                    value="affiliate-commissions"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 transition-all duration-300 rounded-lg"
                  >
                    Hoa hồng
                  </TabsTrigger>
                  <TabsTrigger
                    value="affiliate-withdrawals"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 transition-all duration-300 rounded-lg"
                  >
                    Rút tiền
                  </TabsTrigger>
                  <TabsTrigger
                    value="affiliate-referrals"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 transition-all duration-300 rounded-lg"
                  >
                    Giới thiệu
                  </TabsTrigger>
                  <TabsTrigger
                    value="affiliate-settings"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 transition-all duration-300 rounded-lg"
                  >
                    Cài đặt
                  </TabsTrigger>
                </TabsList>
              )}
            </div>            {/* Profile Tab Content */}
            <TabsContent value="profile" className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
                  <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
                </div>
                {!editingProfile && (
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingProfile(true)}
                    className="border-green-300 text-green-600 hover:bg-green-50"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-green-700 font-medium">Họ và tên</Label>
                    {editingProfile ? (
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="border-green-300 focus:border-green-500 focus:ring-green-200"
                      />
                    ) : (
                      <div className="p-3 bg-white rounded-lg border border-green-200 text-gray-800">
                        {user.fullName || 'Người dùng'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-green-700 font-medium">Email</Label>
                    <div className="p-3 bg-white rounded-lg border border-green-200 text-gray-800 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      {user.email}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-green-700 font-medium">Số điện thoại</Label>
                    {editingProfile ? (
                      <Input
                        id="phoneNumber"
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="border-green-300 focus:border-green-500 focus:ring-green-200"
                      />
                    ) : (
                      <div className="p-3 bg-white rounded-lg border border-green-200 text-gray-800 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        {user.phoneNumber || "Chưa cập nhật"}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="idCard" className="text-green-700 font-medium">CMND/CCCD</Label>
                    <div className="p-3 bg-white rounded-lg border border-green-200 text-gray-800 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      {user.idCardNumber || "Chưa cập nhật"}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-2">
                  <Label htmlFor="address" className="text-green-700 font-medium">Địa chỉ</Label>
                  {editingProfile ? (
                    <Input
                      id="address"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                      className="border-green-300 focus:border-green-500 focus:ring-green-200"
                    />
                  ) : (
                    <div className="p-3 bg-white rounded-lg border border-green-200 text-gray-800 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      {user.address || "Chưa cập nhật"}
                    </div>
                  )}
                </div>
                
                {editingProfile && (
                  <div className="flex space-x-3 mt-6">
                    <Button 
                      onClick={handleProfileUpdate}
                      className="bg-green-600 hover:bg-green-700 shadow-lg"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingProfile(false)}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>            {/* Security Tab Content */}
            <TabsContent value="security" className="p-6 space-y-6">
              {editingPassword ? (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <PasswordChangeForm 
                    onCancel={() => setEditingPassword(false)}
                    onSuccess={() => setEditingPassword(false)}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Bảo mật tài khoản</h2>
                      <p className="text-gray-600">Quản lý mật khẩu và cài đặt bảo mật</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingPassword(true)}
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Đổi mật khẩu
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Password Security Card */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-100 p-3 rounded-full">
                            <Lock className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-800">Mật khẩu</h3>
                            <p className="text-sm text-green-600">Được cập nhật lần cuối: 30 ngày trước</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <Shield className="h-3 w-3 mr-1" />
                          Bảo mật
                        </Badge>
                      </div>
                    </div>

                    {/* Two-Factor Authentication Card */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-orange-100 p-3 rounded-full">
                            <Shield className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-orange-800">Xác thực hai bước</h3>
                            <p className="text-sm text-orange-600">Tăng cường bảo mật cho tài khoản</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-orange-300 text-orange-700">
                          Chưa kích hoạt
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          Kích hoạt ngay
                        </Button>
                      </div>
                    </div>

                    {/* Login Activity Card */}
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                          <Bell className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-purple-800">Hoạt động đăng nhập</h3>
                          <p className="text-sm text-purple-600">Theo dõi các lần đăng nhập gần đây</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-100">
                          <div>
                            <p className="text-sm font-medium">Thiết bị hiện tại</p>
                            <p className="text-xs text-gray-600">Chrome on Windows • Hôm nay, 14:30</p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-700">Đang hoạt động</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-100">
                          <div>
                            <p className="text-sm font-medium">iPhone Safari</p>
                            <p className="text-xs text-gray-600">Hôm qua, 09:15</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            Đăng xuất
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>            {/* Bank Tab Content */}
            <TabsContent value="bank" className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Thông tin ngân hàng</h2>
                  <p className="text-gray-600">Quản lý thông tin tài khoản ngân hàng để nhận hoa hồng</p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Cập nhật
                </Button>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-blue-700 font-medium">Ngân hàng</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-200 text-gray-800 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      {user.bankName || "Chưa cập nhật"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-blue-700 font-medium">Số tài khoản</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-200 text-gray-800 font-mono">
                      {user.accountNumber || "Chưa cập nhật"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-blue-700 font-medium">Chi nhánh</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-200 text-gray-800 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      {user.branch || "Chưa cập nhật"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-blue-700 font-medium">Tên chủ tài khoản</Label>
                    <div className="p-3 bg-white rounded-lg border border-blue-200 text-gray-800 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      {user.accountName || "Chưa cập nhật"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Security Notice */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-full flex-shrink-0">
                    <Shield className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">Lưu ý bảo mật</h3>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      Thông tin ngân hàng được sử dụng để thanh toán hoa hồng và các giao dịch khác. 
                      Vui lòng liên hệ admin để cập nhật thông tin này một cách an toàn.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Liên hệ Admin
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Gửi yêu cầu
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History Preview */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Lịch sử thanh toán gần đây</h3>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    Xem tất cả
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-medium text-green-800">Hoa hồng tháng 4</p>
                      <p className="text-sm text-green-600">25/04/2025</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">+2,500,000đ</p>
                      <Badge className="bg-green-100 text-green-700 text-xs">Đã thanh toán</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-blue-800">Hoa hồng tháng 3</p>
                      <p className="text-sm text-blue-600">25/03/2025</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-700">+1,800,000đ</p>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">Đã thanh toán</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>            {/* Orders Tab Content */}
            <TabsContent value="orders" className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Lịch sử đơn hàng</h2>
                <p className="text-gray-600">Theo dõi tất cả đơn hàng và trạng thái giao hàng</p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-1 border border-gray-200">
                <div className="bg-white rounded-xl p-4">
                  <OrderHistory userId={user.id} />
                </div>
              </div>
            </TabsContent>

            {/* Affiliate Tabs Content */}
            {(user.role === "COLLABORATOR" || user.role === "AGENT") && (
              <>
                {/* Affiliate Dashboard */}
                <TabsContent value="affiliate-dashboard" className="p-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-1 border border-green-200">
                    <div className="bg-white rounded-xl p-4">
                      <AffiliateDashboard />
                    </div>
                  </div>
                </TabsContent>

                {/* Affiliate Links Management */}
                <TabsContent value="affiliate-links" className="p-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-1 border border-blue-200">
                    <div className="bg-white rounded-xl p-4">
                      <LinksManagement />
                    </div>
                  </div>
                </TabsContent>

                {/* Affiliate Performance */}
                <TabsContent value="affiliate-performance" className="p-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-1 border border-purple-200">
                    <div className="bg-white rounded-xl p-4">
                      <AffiliatePerformance />
                    </div>
                  </div>
                </TabsContent>

                {/* Affiliate Commissions */}
                <TabsContent value="affiliate-commissions" className="p-6">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-1 border border-yellow-200">
                    <div className="bg-white rounded-xl p-4">
                      <AffiliateCommissions />
                    </div>
                  </div>
                </TabsContent>

                {/* Affiliate Withdrawals */}
                <TabsContent value="affiliate-withdrawals" className="p-6">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-1 border border-red-200">
                    <div className="bg-white rounded-xl p-4">
                      <AffiliateWithdrawals />
                    </div>
                  </div>
                </TabsContent>

                {/* Affiliate Referrals */}
                <TabsContent value="affiliate-referrals" className="p-6">
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-1 border border-teal-200">
                    <div className="bg-white rounded-xl p-4">
                      <AffiliateReferrals />
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
