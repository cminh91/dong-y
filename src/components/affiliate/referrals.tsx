"use client"

import { useState, useEffect, useRef } from "react"
import {
  Users, Copy, Share2, UserPlus, Crown, QrCode, Download
} from "lucide-react"
import { toast } from "sonner"
import QRCode from "qrcode"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Referral {
  id: string
  fullName: string
  email: string
  role: string
  status: string
  affiliateLevel: number
  createdAt: string
  _count: {
    referredUsers: number
    orders: number
  }
}

interface ReferralsData {
  user: {
    referralCode: string
    referralLink: string
    affiliateLevel: number
  }
  referrals: {
    direct: Referral[]
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
  }
}

export function AffiliateReferrals() {
  const [data, setData] = useState<ReferralsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetchReferrals()
  }, [page])

  useEffect(() => {
    if (data?.user.referralLink) {
      generateQRCode(data.user.referralLink)
    }
  }, [data?.user.referralLink])

  const generateQRCode = async (text: string) => {
    try {
      const url = await QRCode.toDataURL(text, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

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

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.download = `qr-code-${data?.user.referralCode}.png`
      link.href = qrCodeUrl
      link.click()
      toast.success('Đã tải xuống QR code!')
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
          <p className="text-gray-600">Mời bạn bè tham gia với mã giới thiệu của bạn</p>
        </div>
        {getLevelBadge(data.user.affiliateLevel)}
      </div>

      {/* Referral Link Section */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Mã giới thiệu của bạn
          </CardTitle>
          <CardDescription>
            Chia sẻ mã này để mời bạn bè tham gia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Link giới thiệu</label>
            <div className="flex items-center space-x-2">
              <Input
                value={data.user.referralLink}
                readOnly
                className="flex-1 bg-white"
              />
              <Button onClick={copyReferralLink} size="sm">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={shareReferralLink} size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Referral Code and QR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Referral Code */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Mã giới thiệu</label>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <code className="text-2xl font-bold text-green-600 font-mono">
                  {data.user.referralCode}
                </code>
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={copyReferralCode} className="w-full">
                    <Copy className="h-4 w-4 mr-2" />
                    Sao chép mã
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Mã này là duy nhất và không thể thay đổi
              </p>
            </div>

            {/* QR Code */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">QR Code</label>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
                {qrCodeUrl ? (
                  <div className="space-y-3">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="mx-auto w-32 h-32"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full">
                          <QrCode className="h-4 w-4 mr-2" />
                          Xem QR lớn
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>QR Code giới thiệu</DialogTitle>
                          <DialogDescription>
                            Quét mã này để truy cập link giới thiệu
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4">
                          <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-64 h-64"
                          />
                          <Button onClick={downloadQRCode} className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Tải xuống QR Code
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 text-center">
                Quét để truy cập link giới thiệu
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người được giới thiệu</CardTitle>
          <CardDescription>
            {data.referrals.direct.length} người được giới thiệu trực tiếp
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
                          <p className="text-sm text-gray-500">
                            Tham gia: {formatDate(referral.createdAt)}
                          </p>
                        </div>
                      </div>
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
    </div>
  )
}
