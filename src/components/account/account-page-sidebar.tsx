"use client"

import { useState } from "react"
import {
  User, Settings, CreditCard, Lock, Calendar,
  Share2, Link, TrendingUp, DollarSign, Banknote,
  Users, LogOut
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { logoutAction } from "@/lib/auth-actions"

// Import affiliate components
import { AffiliateDashboard } from "../affiliate/dashboard"
import { LinksManagement } from "../affiliate/links-management-new"
import { AffiliatePerformance } from "../affiliate/performance"
import { AffiliateCommissions } from "../affiliate/commissions"
import { AffiliateWithdrawals } from "../affiliate/withdrawals"
import { AffiliateReferrals } from "../affiliate/referrals"
import { AffiliateSettings } from "../affiliate/settings"

// Import basic components (you'll need to create these)
import { ProfileTab } from "./tabs/profile-tab"
import { SecurityTab } from "./tabs/security-tab"
import { BankTab } from "./tabs/bank-tab"
import { OrdersTab } from "./tabs/orders-tab"

interface UserPayload {
  userId: string
  email: string
  role: string
  fullName: string
  affiliateLevel?: number
}

interface AccountPageSidebarProps {
  userPayload: UserPayload
}

export function AccountPageSidebar({ userPayload }: AccountPageSidebarProps) {
  const [activeTab, setActiveTab] = useState(
    (userPayload.role === "COLLABORATOR" || userPayload.role === "AGENT") 
      ? "affiliate-dashboard" 
      : "profile"
  )

  const handleLogout = async () => {
    try {
      await logoutAction()
      toast.success("Đăng xuất thành công")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Đăng xuất thất bại")
    }
  }

  const basicMenuItems = [
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: User, color: 'text-blue-600' },
    { id: 'security', label: 'Bảo mật', icon: Lock, color: 'text-red-600' },
    { id: 'bank', label: 'Ngân hàng', icon: CreditCard, color: 'text-purple-600' },
    { id: 'orders', label: 'Đơn hàng', icon: Calendar, color: 'text-orange-600' },
  ]

  const affiliateMenuItems = [
    { id: 'affiliate-dashboard', label: 'Dashboard', icon: Share2, color: 'text-green-600' },
    { id: 'affiliate-links', label: 'Quản lý Links', icon: Link, color: 'text-blue-600' },
    { id: 'affiliate-performance', label: 'Thống kê', icon: TrendingUp, color: 'text-purple-600' },
    { id: 'affiliate-commissions', label: 'Hoa hồng', icon: DollarSign, color: 'text-yellow-600' },
    { id: 'affiliate-withdrawals', label: 'Rút tiền', icon: Banknote, color: 'text-red-600' },
    { id: 'affiliate-referrals', label: 'Giới thiệu', icon: Users, color: 'text-teal-600' },
    { id: 'affiliate-settings', label: 'Cài đặt', icon: Settings, color: 'text-gray-600' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab userPayload={userPayload} />
      case 'security':
        return <SecurityTab userPayload={userPayload} />
      case 'bank':
        return <BankTab userPayload={userPayload} />
      case 'orders':
        return <OrdersTab userPayload={userPayload} />
      case 'affiliate-dashboard':
        return <AffiliateDashboard />
      case 'affiliate-links':
        return <LinksManagement />
      case 'affiliate-performance':
        return <AffiliatePerformance />
      case 'affiliate-commissions':
        return <AffiliateCommissions />
      case 'affiliate-withdrawals':
        return <AffiliateWithdrawals />
      case 'affiliate-referrals':
        return <AffiliateReferrals />
      case 'affiliate-settings':
        return <AffiliateSettings />
      default:
        return <ProfileTab userPayload={userPayload} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg min-h-screen">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{userPayload.fullName}</h2>
                <p className="text-green-100">{userPayload.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {userPayload.role === 'COLLABORATOR' ? 'Cộng tác viên' : 
                     userPayload.role === 'AGENT' ? 'Đại lý' : 
                     userPayload.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}
                  </Badge>
                  {(userPayload.role === "COLLABORATOR" || userPayload.role === "AGENT") && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100 border-yellow-300/30">
                      Level {userPayload.affiliateLevel || 1}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="p-4">
            {/* Basic Menu */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Tài khoản
              </h3>
              <nav className="space-y-1">
                {basicMenuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${activeTab === item.id ? 'text-green-600' : item.color}`} />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Affiliate Menu */}
            {(userPayload.role === "COLLABORATOR" || userPayload.role === "AGENT") && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Affiliate Portal
                </h3>
                <nav className="space-y-1">
                  {affiliateMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mr-3 ${activeTab === item.id ? 'text-green-600' : item.color}`} />
                        {item.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            )}

            {/* Logout Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Card className="min-h-[calc(100vh-4rem)] p-6">
            {renderContent()}
          </Card>
        </div>
      </div>
    </div>
  )
}
