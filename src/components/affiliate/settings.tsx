"use client"

import { useState, useEffect } from "react"
import { 
  User, CreditCard, Shield, Bell, Plus, 
  Edit2, Trash2, Check, X, Upload
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SettingsData {
  profile: {
    id: string
    fullName: string
    email: string
    phoneNumber: string
    address: string
    referralCode: string
    affiliateLevel: number
    commissionRate: number
    status: string
    createdAt: string
  }
  bankAccounts: Array<{
    id: string
    bankName: string
    accountNumber: string
    accountHolder: string
    branch?: string
    isVerified: boolean
    createdAt: string
  }>
  idCards: Array<{
    id: string
    idNumber: string
    fullName: string
    dateOfBirth: string
    address?: string
    issueDate?: string
    issuePlace?: string
    frontImage: string
    backImage?: string
    isVerified: boolean
    createdAt: string
  }>
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    weeklyReports: boolean
    monthlyReports: boolean
  }
}

export function AffiliateSettings() {
  const [data, setData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [showIdDialog, setShowIdDialog] = useState(false)
  
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phoneNumber: '',
    address: ''
  })

  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    branch: ''
  })

  const [idForm, setIdForm] = useState({
    idNumber: '',
    fullName: '',
    dateOfBirth: '',
    address: '',
    issueDate: '',
    issuePlace: '',
    frontImage: '',
    backImage: ''
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    monthlyReports: true
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/affiliate/settings')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setProfileForm({
          fullName: result.data.profile.fullName,
          phoneNumber: result.data.profile.phoneNumber,
          address: result.data.profile.address
        })
        setPreferences(result.data.preferences)
      } else {
        toast.error(result.error || 'Không thể tải cài đặt')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      const response = await fetch('/api/affiliate/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          data: profileForm
        })
      })

      const result = await response.json()
      if (result.success) {
        setData(prev => prev ? {
          ...prev,
          profile: { ...prev.profile, ...result.data.profile }
        } : null)
        toast.success('Cập nhật thông tin thành công!')
      } else {
        toast.error(result.error || 'Cập nhật thất bại')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Lỗi kết nối server')
    }
  }

  const addBankAccount = async () => {
    try {
      const response = await fetch('/api/affiliate/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bank_account',
          data: bankForm
        })
      })

      const result = await response.json()
      if (result.success) {
        setData(prev => prev ? {
          ...prev,
          bankAccounts: [result.data.bankAccount, ...prev.bankAccounts]
        } : null)
        setShowBankDialog(false)
        setBankForm({ bankName: '', accountNumber: '', accountHolder: '', branch: '' })
        toast.success('Thêm tài khoản ngân hàng thành công!')
      } else {
        toast.error(result.error || 'Thêm tài khoản thất bại')
      }
    } catch (error) {
      console.error('Error adding bank account:', error)
      toast.error('Lỗi kết nối server')
    }
  }

  const addIdCard = async () => {
    try {
      const response = await fetch('/api/affiliate/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'id_card',
          data: idForm
        })
      })

      const result = await response.json()
      if (result.success) {
        setData(prev => prev ? {
          ...prev,
          idCards: [result.data.idCard, ...prev.idCards]
        } : null)
        setShowIdDialog(false)
        setIdForm({
          idNumber: '', fullName: '', dateOfBirth: '', address: '',
          issueDate: '', issuePlace: '', frontImage: '', backImage: ''
        })
        toast.success('Thêm CMND/CCCD thành công!')
      } else {
        toast.error(result.error || 'Thêm CMND/CCCD thất bại')
      }
    } catch (error) {
      console.error('Error adding ID card:', error)
      toast.error('Lỗi kết nối server')
    }
  }

  const deleteItem = async (type: 'bank_account' | 'id_card', id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return

    try {
      const response = await fetch(`/api/affiliate/settings?type=${type}&id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        if (type === 'bank_account') {
          setData(prev => prev ? {
            ...prev,
            bankAccounts: prev.bankAccounts.filter(acc => acc.id !== id)
          } : null)
        } else {
          setData(prev => prev ? {
            ...prev,
            idCards: prev.idCards.filter(card => card.id !== id)
          } : null)
        }
        toast.success('Xóa thành công!')
      } else {
        toast.error(result.error || 'Xóa thất bại')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Lỗi kết nối server')
    }
  }

  const updatePreferences = async () => {
    try {
      const response = await fetch('/api/affiliate/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'preferences',
          data: preferences
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Cập nhật tùy chọn thành công!')
      } else {
        toast.error(result.error || 'Cập nhật thất bại')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Lỗi kết nối server')
    }
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
        <p className="text-gray-600">Không thể tải cài đặt</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cài đặt Affiliate</h2>
        <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="banking">Ngân hàng</TabsTrigger>
          <TabsTrigger value="verification">Xác thực</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>Cập nhật thông tin cơ bản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={data.profile.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mã giới thiệu</Label>
                  <Input value={data.profile.referralCode} disabled />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Textarea
                  value={profileForm.address}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cấp độ Affiliate</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Level {data.profile.affiliateLevel}</Badge>
                    <span className="text-sm text-gray-600">
                      Tỷ lệ hoa hồng: {(data.profile.commissionRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Trạng thái tài khoản</Label>
                  <Badge variant={data.profile.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {data.profile.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
              </div>

              <Button onClick={updateProfile}>
                Cập nhật thông tin
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banking Tab */}
        <TabsContent value="banking">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Tài khoản ngân hàng
                  </CardTitle>
                  <CardDescription>Quản lý tài khoản ngân hàng để rút tiền</CardDescription>
                </div>
                <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm tài khoản
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm tài khoản ngân hàng</DialogTitle>
                      <DialogDescription>
                        Thêm tài khoản ngân hàng để nhận tiền rút
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tên ngân hàng</Label>
                        <Select 
                          value={bankForm.bankName} 
                          onValueChange={(value) => setBankForm(prev => ({ ...prev, bankName: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn ngân hàng" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vietcombank">Vietcombank</SelectItem>
                            <SelectItem value="VietinBank">VietinBank</SelectItem>
                            <SelectItem value="BIDV">BIDV</SelectItem>
                            <SelectItem value="Agribank">Agribank</SelectItem>
                            <SelectItem value="Techcombank">Techcombank</SelectItem>
                            <SelectItem value="MBBank">MBBank</SelectItem>
                            <SelectItem value="ACB">ACB</SelectItem>
                            <SelectItem value="VPBank">VPBank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Số tài khoản</Label>
                        <Input
                          value={bankForm.accountNumber}
                          onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                          placeholder="Nhập số tài khoản"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tên chủ tài khoản</Label>
                        <Input
                          value={bankForm.accountHolder}
                          onChange={(e) => setBankForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                          placeholder="Nhập tên chủ tài khoản"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Chi nhánh (tùy chọn)</Label>
                        <Input
                          value={bankForm.branch}
                          onChange={(e) => setBankForm(prev => ({ ...prev, branch: e.target.value }))}
                          placeholder="Nhập tên chi nhánh"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={addBankAccount}>Thêm tài khoản</Button>
                        <Button variant="outline" onClick={() => setShowBankDialog(false)}>Hủy</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.bankAccounts.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Chưa có tài khoản ngân hàng nào</p>
                    <Button onClick={() => setShowBankDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm tài khoản đầu tiên
                    </Button>
                  </div>
                ) : (
                  data.bankAccounts.map((account) => (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{account.bankName}</h3>
                            <Badge variant={account.isVerified ? 'default' : 'secondary'}>
                              {account.isVerified ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Đã xác thực
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3 mr-1" />
                                  Chưa xác thực
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {account.accountNumber} - {account.accountHolder}
                          </p>
                          {account.branch && (
                            <p className="text-xs text-gray-500">Chi nhánh: {account.branch}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteItem('bank_account', account.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Xác thực danh tính
                  </CardTitle>
                  <CardDescription>Xác thực CMND/CCCD để tăng độ tin cậy</CardDescription>
                </div>
                <Dialog open={showIdDialog} onOpenChange={setShowIdDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm CMND/CCCD
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Thêm CMND/CCCD</DialogTitle>
                      <DialogDescription>
                        Cung cấp thông tin CMND/CCCD để xác thực danh tính
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Số CMND/CCCD</Label>
                          <Input
                            value={idForm.idNumber}
                            onChange={(e) => setIdForm(prev => ({ ...prev, idNumber: e.target.value }))}
                            placeholder="Nhập số CMND/CCCD"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Họ và tên</Label>
                          <Input
                            value={idForm.fullName}
                            onChange={(e) => setIdForm(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="Nhập họ tên"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Ngày sinh</Label>
                          <Input
                            type="date"
                            value={idForm.dateOfBirth}
                            onChange={(e) => setIdForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ngày cấp</Label>
                          <Input
                            type="date"
                            value={idForm.issueDate}
                            onChange={(e) => setIdForm(prev => ({ ...prev, issueDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Nơi cấp</Label>
                        <Input
                          value={idForm.issuePlace}
                          onChange={(e) => setIdForm(prev => ({ ...prev, issuePlace: e.target.value }))}
                          placeholder="Nhập nơi cấp"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ảnh mặt trước (URL)</Label>
                        <Input
                          value={idForm.frontImage}
                          onChange={(e) => setIdForm(prev => ({ ...prev, frontImage: e.target.value }))}
                          placeholder="Nhập URL ảnh mặt trước"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ảnh mặt sau (URL - tùy chọn)</Label>
                        <Input
                          value={idForm.backImage}
                          onChange={(e) => setIdForm(prev => ({ ...prev, backImage: e.target.value }))}
                          placeholder="Nhập URL ảnh mặt sau"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={addIdCard}>Thêm CMND/CCCD</Button>
                        <Button variant="outline" onClick={() => setShowIdDialog(false)}>Hủy</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.idCards.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Chưa có CMND/CCCD nào</p>
                    <Button onClick={() => setShowIdDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm CMND/CCCD
                    </Button>
                  </div>
                ) : (
                  data.idCards.map((idCard) => (
                    <div key={idCard.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">CMND/CCCD: {idCard.idNumber}</h3>
                            <Badge variant={idCard.isVerified ? 'default' : 'secondary'}>
                              {idCard.isVerified ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Đã xác thực
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3 mr-1" />
                                  Chưa xác thực
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{idCard.fullName}</p>
                          <p className="text-xs text-gray-500">
                            Ngày sinh: {new Date(idCard.dateOfBirth).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteItem('id_card', idCard.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Cài đặt thông báo
              </CardTitle>
              <CardDescription>Quản lý các loại thông báo bạn muốn nhận</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Thông báo email</h3>
                  <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Thông báo SMS</h3>
                  <p className="text-sm text-gray-600">Nhận thông báo qua tin nhắn</p>
                </div>
                <Switch
                  checked={preferences.smsNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, smsNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Báo cáo hàng tuần</h3>
                  <p className="text-sm text-gray-600">Nhận báo cáo hiệu suất hàng tuần</p>
                </div>
                <Switch
                  checked={preferences.weeklyReports}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, weeklyReports: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Báo cáo hàng tháng</h3>
                  <p className="text-sm text-gray-600">Nhận báo cáo hiệu suất hàng tháng</p>
                </div>
                <Switch
                  checked={preferences.monthlyReports}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, monthlyReports: checked }))
                  }
                />
              </div>

              <Button onClick={updatePreferences}>
                Lưu cài đặt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
