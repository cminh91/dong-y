"use client"

import { useState } from "react"
import { Copy, Share2, QrCode } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ReferralCardProps {
  referralCode: string
  totalReferrals: number
  totalCommission: number
}

export function ReferralCard({ referralCode, totalReferrals, totalCommission }: ReferralCardProps) {
  const referralLink = `${window.location.origin}/dang-ky?ref=${referralCode}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Đã sao chép vào clipboard")
    }).catch(() => {
      toast.error("Không thể sao chép")
    })
  }

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tham gia Đông Y Pharmacy",
          text: `Đăng ký tài khoản Đông Y Pharmacy với mã giới thiệu của tôi để nhận ưu đãi đặc biệt!`,
          url: referralLink,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      copyToClipboard(referralLink)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chương trình giới thiệu</CardTitle>
        <CardDescription>Chia sẻ mã giới thiệu để nhận hoa hồng</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{totalReferrals}</div>
            <div className="text-sm text-green-600">Người giới thiệu</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {totalCommission.toLocaleString('vi-VN')}đ
            </div>
            <div className="text-sm text-blue-600">Tổng hoa hồng</div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="space-y-2">
          <Label>Mã giới thiệu của bạn</Label>
          <div className="flex space-x-2">
            <Input value={referralCode} readOnly />
            <Button variant="outline" onClick={() => copyToClipboard(referralCode)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <Label>Link giới thiệu</Label>
          <div className="flex space-x-2">
            <Input value={referralLink} readOnly className="text-xs" />
            <Button variant="outline" onClick={() => copyToClipboard(referralLink)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex space-x-2">
          <Button onClick={shareReferral} className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Chia sẻ
          </Button>
          <Button variant="outline" onClick={() => toast.info("Tính năng QR Code sẽ sớm có")}>
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Cách nhận hoa hồng:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Chia sẻ mã giới thiệu hoặc link với bạn bè</li>
            <li>• Khi họ đăng ký thành công, bạn sẽ nhận hoa hồng</li>
            <li>• Hoa hồng được tính theo tổng giá trị đơn hàng của người được giới thiệu</li>
            <li>• Hoa hồng được thanh toán hàng tháng vào tài khoản ngân hàng</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
