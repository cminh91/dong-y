"use client"

import { useState, useEffect } from "react"
import { 
  Users, Copy, Share2, TrendingUp, DollarSign, 
  UserPlus, Crown, Gift, RefreshCw, QrCode
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Referral {
  id: string
  fullName: string
  email: string
  role: string
  status: string
  totalCommission: number
  affiliateLevel: number
  createdAt: string
  _count: {
    referredUsers: number
    orders: number
  }
  level2Referrals: Array<{
    id: string
    fullName: string
    email: string
    totalCommission: number
    createdAt: string
  }>
}

interface ReferralsData {
  user: {
    referralCode: string
    referralLink: string
    totalCommission: number
    affiliateLevel: number
  }
  referrals: {
    direct: Referral[]
    level2Count: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  statistics: {
    totalReferrals: number
    newReferrals: number
    activeReferrals: number
    periodCommission: number
    totalCommission: number
  }
  recentCommissions: Array<{
    id: string
    amount: number
    createdAt: string
    fromUser: {
      fullName: string
      email: string
    }
  }>
}

export function AffiliateReferrals() {
  const [data, setData] = useState<ReferralsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchReferrals()
  }, [page])

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      const response = await fetch(`/api/affiliate/referrals?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        toast.error(result.error || 'Không thể tải dữ liệu giới thiệu')
      }
    } catch (error) {
      console.error('Error fetching referrals:', error)
      toast.error('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    if (data?.user.referralLink) {
      navigator.clipboard.writeText(data.user.referralLink)
      toast.success('Đã sao chép link giới thiệu!')
    }
  }

  const copyReferralCode = () => {
    if (data?.user.referralCode) {
      navigator.clipboard.writeText(data.user.referralCode)
      toast.success('Đã sao chép mã giới thiệu!')
    }
  }

  const regenerateCode = async () => {
    try {
      const response = await fetch('/api/affiliate/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate_code' })
      })

      const result = await response.json()
      if (result.success) {
        setData(prev => prev ? {
          ...prev,
          user: {
            ...prev.user,
            referralCode: result.data.referralCode,
            referralLink: result.data.referralLink
          }
        } : null)
        toast.success('Đã tạo mã giới thiệu mới!')
      } else {
        toast.error(result.error || 'Không thể tạo mã mới')
      }
    } catch (error) {
      console.error('Error regenerating code:', error)
      toast.error('Lỗi kết nối server')
    }
  }

  const shareReferralLink = () => {
    if (navigator.share && data?.user.referralLink) {
      navigator.share({
        title: 'Tham gia cùng tôi',
        text: 'Đăng ký tài khoản và nhận ưu đãi đặc biệt!',
        url: data.user.referralLink
      })
    } else {
      copyReferralLink()
    }
  }

  const getLevelBadge = (level: number) => {
    const levels = [
      { min: 1, max: 1, name: 'Newbie', color: 'bg-gray-500' },
      { min: 2, max: 2, name: 'Bronze', color: 'bg-orange-600' },
      { min: 3, max: 3, name: 'Silver', color: 'bg-gray-400' },
      { min: 4, max: 4, name: 'Gold', color: 'bg-yellow-500' },
      { min: 5, max: 5, name: 'Diamond', color: 'bg-blue-600' }
    ]
    
    const levelInfo = levels.find(l => level >= l.min && level <= l.max) || levels[0]
    
    return (
      <Badge className={`${levelInfo.color} text-white`}>
        <Crown className="h-3 w-3 mr-1" />
        {levelInfo.name}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Không thể tải dữ liệu giới thiệu</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hệ thống Giới thiệu</h2>
          <p className="text-gray-600">Mời bạn bè tham gia và nhận hoa hồng</p>
        </div>
        {getLevelBadge(data.user.affiliateLevel)}
      </div>

      {/* Referral Link Section */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Link giới thiệu của bạn
          </CardTitle>
          <CardDescription>
            Chia sẻ link này để mời bạn bè tham gia và nhận hoa hồng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              value={data.user.referralLink}
              readOnly
              className="flex-1 bg-white"
            />
            <Button onClick={copyReferralLink}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={shareReferralLink}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Mã giới thiệu</p>
                <div className="flex items-center space-x-2">
                  <code className="bg-white px-3 py-1 rounded border font-mono text-lg">
                    {data.user.referralCode}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyReferralCode}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <Button variant="outline" onClick={regenerateCode}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tạo mã mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng giới thiệu</p>
                <p className="text-2xl font-bold">{data.statistics.totalReferrals}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mới tháng này</p>
                <p className="text-2xl font-bold text-green-600">{data.statistics.newReferrals}</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-purple-600">{data.statistics.activeReferrals}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">HH tháng này</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {data.statistics.periodCommission.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <Gift className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng hoa hồng</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {data.statistics.totalCommission.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals">Danh sách giới thiệu</TabsTrigger>
          <TabsTrigger value="commissions">Hoa hồng từ giới thiệu</TabsTrigger>
        </TabsList>

        {/* Referrals List */}
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách người được giới thiệu</CardTitle>
              <CardDescription>
                {data.referrals.direct.length} người được giới thiệu trực tiếp, 
                {data.referrals.level2Count} người cấp 2
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.referrals.direct.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Bạn chưa giới thiệu ai</p>
                    <Button onClick={shareReferralLink}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Chia sẻ link giới thiệu
                    </Button>
                  </div>
                ) : (
                  data.referrals.direct.map((referral) => (
                    <div key={referral.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              <AvatarInitials name={referral.fullName} />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">{referral.fullName}</h3>
                              {getLevelBadge(referral.affiliateLevel)}
                              <Badge variant={referral.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {referral.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{referral.email}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Tham gia: {formatDate(referral.createdAt)}</span>
                              <span>Đơn hàng: {referral._count.orders}</span>
                              <span>Giới thiệu: {referral._count.referredUsers}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {referral.totalCommission.toLocaleString('vi-VN')}đ
                          </p>
                          <p className="text-xs text-gray-500">Tổng hoa hồng</p>
                        </div>
                      </div>

                      {/* Level 2 Referrals */}
                      {referral.level2Referrals.length > 0 && (
                        <div className="mt-4 pl-12 border-l-2 border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Cấp 2 ({referral.level2Referrals.length} người):
                          </p>
                          <div className="space-y-2">
                            {referral.level2Referrals.slice(0, 3).map((l2) => (
                              <div key={l2.id} className="flex items-center justify-between text-sm">
                                <span>{l2.fullName}</span>
                                <span className="text-green-600">
                                  {l2.totalCommission.toLocaleString('vi-VN')}đ
                                </span>
                              </div>
                            ))}
                            {referral.level2Referrals.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{referral.level2Referrals.length - 3} người khác
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {data.pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Trang {data.pagination.page} / {data.pagination.pages}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.pagination.pages}
                      onClick={() => setPage(page + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions from Referrals */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Hoa hồng từ giới thiệu</CardTitle>
              <CardDescription>Lịch sử hoa hồng nhận được từ người được giới thiệu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentCommissions.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Chưa có hoa hồng từ giới thiệu</p>
                  </div>
                ) : (
                  data.recentCommissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{commission.fromUser.fullName}</p>
                        <p className="text-sm text-gray-600">{commission.fromUser.email}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(commission.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          +{commission.amount.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
