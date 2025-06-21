"use client"

import { useState, useEffect } from 'react'
import { 
  Save, Settings, DollarSign, Users, 
  Link2, Shield, Bell, Mail, Percent
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AffiliateSettings {
  commissions: {
    defaultRate: number
    level1Rate: number
    level2Rate: number
    minWithdrawal: number
    withdrawalFee: number
    paymentSchedule: string
  }
  registration: {
    autoApproval: boolean
    requireVerification: boolean
    welcomeBonus: number
    referralBonus: number
  }
  links: {
    linkExpiry: number
    maxLinksPerUser: number
    trackingCookieDuration: number
    allowCustomSlugs: boolean
  }
  notifications: {
    emailNotifications: boolean
    newRegistrationAlert: boolean
    withdrawalRequestAlert: boolean
    commissionAlert: boolean
  }
  security: {
    requireTwoFactor: boolean
    sessionTimeout: number
    ipWhitelist: string
    fraudDetection: boolean
  }
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<AffiliateSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/affiliate/settings')
      const data = await response.json()

      if (data.success) {
        setSettings(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      // Fallback to mock data on error
      const mockSettings: AffiliateSettings = {
        commissions: {
          defaultRate: 0.15,
          level1Rate: 0.15,
          level2Rate: 0.05,
          minWithdrawal: 100000,  // Giảm từ 500k xuống 100k
          withdrawalFee: 5000,    // Giảm từ 50k xuống 5k
          paymentSchedule: 'weekly'
        },
        registration: {
          autoApproval: false,
          requireVerification: true,
          welcomeBonus: 100000,
          referralBonus: 50000
        },
        links: {
          linkExpiry: 365,
          maxLinksPerUser: 50,
          trackingCookieDuration: 30,
          allowCustomSlugs: true
        },
        notifications: {
          emailNotifications: true,
          newRegistrationAlert: true,
          withdrawalRequestAlert: true,
          commissionAlert: false
        },
        security: {
          requireTwoFactor: false,
          sessionTimeout: 60,
          ipWhitelist: '',
          fraudDetection: true
        }
      }
      setSettings(mockSettings)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      console.log('=== SAVING AFFILIATE SETTINGS ===')
      console.log('Current settings:', settings)

      // Save each section separately
      const sections = ['commissions', 'registration', 'links', 'notifications', 'security'] as const

      for (const section of sections) {
        console.log(`Saving ${section} settings:`, settings[section])

        const response = await fetch('/api/admin/affiliate/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section,
            settings: settings[section]
          })
        })

        const data = await response.json()
        console.log(`${section} save response:`, data)

        if (!data.success) {
          throw new Error(data.error || `Failed to save ${section} settings`)
        }
      }

      // Show success message
      console.log('✅ All settings saved successfully!')
      alert('Cài đặt đã được lưu thành công!')
    } catch (error) {
      console.error('❌ Error saving settings:', error)
      alert('Có lỗi xảy ra khi lưu cài đặt: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (section: keyof AffiliateSettings, field: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt Hệ thống</h1>
          <p className="text-gray-600 mt-1">
            Cấu hình các thông số cho hệ thống affiliate
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </Button>
      </div>

      <Tabs defaultValue="commissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="commissions">Hoa hồng</TabsTrigger>
          <TabsTrigger value="registration">Đăng ký</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        {/* Commission Settings */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Cài đặt Hoa hồng
              </CardTitle>
              <CardDescription>
                Cấu hình tỷ lệ hoa hồng và chính sách thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultRate">Tỷ lệ hoa hồng mặc định (%)</Label>
                  <Input
                    id="defaultRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.commissions.defaultRate * 100}
                    onChange={(e) => updateSettings('commissions', 'defaultRate', parseFloat(e.target.value) / 100)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level1Rate">Tỷ lệ hoa hồng cấp 1 (%)</Label>
                  <Input
                    id="level1Rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.commissions.level1Rate * 100}
                    onChange={(e) => updateSettings('commissions', 'level1Rate', parseFloat(e.target.value) / 100)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level2Rate">Tỷ lệ hoa hồng cấp 2 (%)</Label>
                  <Input
                    id="level2Rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.commissions.level2Rate * 100}
                    onChange={(e) => updateSettings('commissions', 'level2Rate', parseFloat(e.target.value) / 100)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minWithdrawal">Số tiền rút tối thiểu (VNĐ)</Label>
                  <Input
                    id="minWithdrawal"
                    type="number"
                    min="0"
                    value={settings.commissions.minWithdrawal}
                    onChange={(e) => updateSettings('commissions', 'minWithdrawal', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdrawalFee">Phí rút tiền (VNĐ)</Label>
                  <Input
                    id="withdrawalFee"
                    type="number"
                    min="0"
                    value={settings.commissions.withdrawalFee}
                    onChange={(e) => updateSettings('commissions', 'withdrawalFee', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentSchedule">Lịch thanh toán</Label>
                  <Select 
                    value={settings.commissions.paymentSchedule} 
                    onValueChange={(value) => updateSettings('commissions', 'paymentSchedule', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Hàng ngày</SelectItem>
                      <SelectItem value="weekly">Hàng tuần</SelectItem>
                      <SelectItem value="monthly">Hàng tháng</SelectItem>
                      <SelectItem value="manual">Thủ công</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registration Settings */}
        <TabsContent value="registration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Cài đặt Đăng ký
              </CardTitle>
              <CardDescription>
                Cấu hình quy trình đăng ký affiliate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tự động duyệt đăng ký</Label>
                  <p className="text-sm text-gray-500">Tự động duyệt affiliate mới mà không cần xem xét</p>
                </div>
                <Switch
                  checked={settings.registration.autoApproval}
                  onCheckedChange={(checked) => updateSettings('registration', 'autoApproval', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Yêu cầu xác minh</Label>
                  <p className="text-sm text-gray-500">Yêu cầu xác minh email và thông tin cá nhân</p>
                </div>
                <Switch
                  checked={settings.registration.requireVerification}
                  onCheckedChange={(checked) => updateSettings('registration', 'requireVerification', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="welcomeBonus">Bonus chào mừng (VNĐ)</Label>
                  <Input
                    id="welcomeBonus"
                    type="number"
                    min="0"
                    value={settings.registration.welcomeBonus}
                    onChange={(e) => updateSettings('registration', 'welcomeBonus', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referralBonus">Bonus giới thiệu (VNĐ)</Label>
                  <Input
                    id="referralBonus"
                    type="number"
                    min="0"
                    value={settings.registration.referralBonus}
                    onChange={(e) => updateSettings('registration', 'referralBonus', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Links Settings */}
        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link2 className="h-5 w-5 mr-2" />
                Cài đặt Links
              </CardTitle>
              <CardDescription>
                Cấu hình quy tắc cho affiliate links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="linkExpiry">Thời hạn link (ngày)</Label>
                  <Input
                    id="linkExpiry"
                    type="number"
                    min="1"
                    value={settings.links.linkExpiry}
                    onChange={(e) => updateSettings('links', 'linkExpiry', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLinksPerUser">Số link tối đa mỗi user</Label>
                  <Input
                    id="maxLinksPerUser"
                    type="number"
                    min="1"
                    value={settings.links.maxLinksPerUser}
                    onChange={(e) => updateSettings('links', 'maxLinksPerUser', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trackingCookieDuration">Thời gian cookie tracking (ngày)</Label>
                  <Input
                    id="trackingCookieDuration"
                    type="number"
                    min="1"
                    value={settings.links.trackingCookieDuration}
                    onChange={(e) => updateSettings('links', 'trackingCookieDuration', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cho phép custom slug</Label>
                  <p className="text-sm text-gray-500">Cho phép affiliate tự tạo slug cho link</p>
                </div>
                <Switch
                  checked={settings.links.allowCustomSlugs}
                  onCheckedChange={(checked) => updateSettings('links', 'allowCustomSlugs', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Cài đặt Thông báo
              </CardTitle>
              <CardDescription>
                Cấu hình thông báo email cho admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bật thông báo email</Label>
                  <p className="text-sm text-gray-500">Gửi thông báo qua email cho admin</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo đăng ký mới</Label>
                  <p className="text-sm text-gray-500">Thông báo khi có affiliate mới đăng ký</p>
                </div>
                <Switch
                  checked={settings.notifications.newRegistrationAlert}
                  onCheckedChange={(checked) => updateSettings('notifications', 'newRegistrationAlert', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo yêu cầu rút tiền</Label>
                  <p className="text-sm text-gray-500">Thông báo khi có yêu cầu rút tiền mới</p>
                </div>
                <Switch
                  checked={settings.notifications.withdrawalRequestAlert}
                  onCheckedChange={(checked) => updateSettings('notifications', 'withdrawalRequestAlert', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo hoa hồng</Label>
                  <p className="text-sm text-gray-500">Thông báo khi có hoa hồng mới được tạo</p>
                </div>
                <Switch
                  checked={settings.notifications.commissionAlert}
                  onCheckedChange={(checked) => updateSettings('notifications', 'commissionAlert', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Cài đặt Bảo mật
              </CardTitle>
              <CardDescription>
                Cấu hình bảo mật cho hệ thống affiliate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Yêu cầu xác thực 2 bước</Label>
                  <p className="text-sm text-gray-500">Bắt buộc affiliate sử dụng 2FA</p>
                </div>
                <Switch
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(checked) => updateSettings('security', 'requireTwoFactor', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Phát hiện gian lận</Label>
                  <p className="text-sm text-gray-500">Tự động phát hiện hoạt động đáng ngờ</p>
                </div>
                <Switch
                  checked={settings.security.fraudDetection}
                  onCheckedChange={(checked) => updateSettings('security', 'fraudDetection', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Thời gian timeout session (phút)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                <Textarea
                  id="ipWhitelist"
                  placeholder="Nhập các IP được phép truy cập, mỗi IP một dòng"
                  value={settings.security.ipWhitelist}
                  onChange={(e) => updateSettings('security', 'ipWhitelist', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
