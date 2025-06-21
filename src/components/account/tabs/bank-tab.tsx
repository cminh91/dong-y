"use client"

import { useState, useEffect } from "react"
import { CreditCard, Plus, Edit2, Trash2, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserPayload {
  userId: string
  email: string
  role: string
  fullName: string
}

interface BankTabProps {
  userPayload: UserPayload
}

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  branch: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

const BANK_OPTIONS = [
  { value: 'VIETCOMBANK', label: 'Vietcombank' },
  { value: 'VIETINBANK', label: 'VietinBank' },
  { value: 'BIDV', label: 'BIDV' },
  { value: 'AGRIBANK', label: 'Agribank' },
  { value: 'TECHCOMBANK', label: 'Techcombank' },
  { value: 'MBBANK', label: 'MB Bank' },
  { value: 'TPBANK', label: 'TP Bank' }
]

export function BankTab({ userPayload }: BankTabProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    branch: "",
    isPrimary: false
  })

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/bank-accounts')
      const data = await response.json()

      if (data.success) {
        setBankAccounts(data.bankAccounts)
      } else {
        toast.error(data.error || 'Không thể tải danh sách tài khoản ngân hàng')
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
      toast.error('Có lỗi xảy ra khi tải danh sách tài khoản ngân hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBank = async () => {
    try {
      const response = await fetch('/api/user/bank-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bankForm),
      })

      const data = await response.json()

      if (data.success) {
        setBankAccounts(prev => [data.bankAccount, ...prev])
        setShowAddForm(false)
        setBankForm({ bankName: "", accountNumber: "", accountName: "", branch: "", isPrimary: false })
        toast.success(data.message || 'Thêm tài khoản ngân hàng thành công')
      } else {
        toast.error(data.error || 'Thêm tài khoản ngân hàng thất bại')
      }
    } catch (error) {
      console.error('Error adding bank account:', error)
      toast.error('Có lỗi xảy ra khi thêm tài khoản ngân hàng')
    }
  }

  const handleUpdateBank = async () => {
    if (!editingAccount) return

    try {
      const response = await fetch(`/api/user/bank-accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bankForm),
      })

      const data = await response.json()

      if (data.success) {
        setBankAccounts(prev =>
          prev.map(account =>
            account.id === editingAccount.id ? data.bankAccount : account
          )
        )
        setEditingAccount(null)
        setBankForm({ bankName: "", accountNumber: "", accountName: "", branch: "", isPrimary: false })
        toast.success(data.message || 'Cập nhật tài khoản ngân hàng thành công')
      } else {
        toast.error(data.error || 'Cập nhật tài khoản ngân hàng thất bại')
      }
    } catch (error) {
      console.error('Error updating bank account:', error)
      toast.error('Có lỗi xảy ra khi cập nhật tài khoản ngân hàng')
    }
  }

  const handleDeleteBank = async (accountId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) return

    try {
      const response = await fetch(`/api/user/bank-accounts/${accountId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setBankAccounts(prev => prev.filter(account => account.id !== accountId))
        toast.success(data.message || 'Xóa tài khoản ngân hàng thành công')
      } else {
        toast.error(data.error || 'Xóa tài khoản ngân hàng thất bại')
      }
    } catch (error) {
      console.error('Error deleting bank account:', error)
      toast.error('Có lỗi xảy ra khi xóa tài khoản ngân hàng')
    }
  }

  const startEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setBankForm({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      branch: account.branch,
      isPrimary: account.isPrimary
    })
    setShowAddForm(true)
  }

  const cancelEdit = () => {
    setEditingAccount(null)
    setShowAddForm(false)
    setBankForm({ bankName: "", accountNumber: "", accountName: "", branch: "", isPrimary: false })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tài khoản ngân hàng</h2>
          <p className="text-gray-600">Quản lý thông tin tài khoản ngân hàng</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchBankAccounts} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm tài khoản
          </Button>
        </div>
      </div>

      {/* Add Bank Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Thêm tài khoản ngân hàng</CardTitle>
            <CardDescription>Nhập thông tin tài khoản ngân hàng mới</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngân hàng</Label>
                <Select
                  value={bankForm.bankName}
                  onValueChange={(value) => setBankForm(prev => ({ ...prev, bankName: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngân hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_OPTIONS.map((bank) => (
                      <SelectItem key={bank.value} value={bank.value}>
                        {bank.label}
                      </SelectItem>
                    ))}
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên chủ tài khoản</Label>
                <Input
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="Nhập tên chủ tài khoản"
                />
              </div>
              <div className="space-y-2">
                <Label>Chi nhánh</Label>
                <Input
                  value={bankForm.branch}
                  onChange={(e) => setBankForm(prev => ({ ...prev, branch: e.target.value }))}
                  placeholder="Nhập tên chi nhánh"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddBank}>Thêm tài khoản</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Hủy</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Accounts List */}
      <div className="space-y-4">
        {bankAccounts.map((account) => (
          <Card key={account.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{account.bankName}</h3>
                      {account.isPrimary && (
                        <Badge className="bg-blue-100 text-blue-800">Chính</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {account.accountNumber} - {account.accountName}
                    </p>
                    {account.branch && (
                      <p className="text-xs text-gray-500">{account.branch}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(account)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteBank(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bankAccounts.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có tài khoản ngân hàng
            </h3>
            <p className="text-gray-600 mb-4">
              Thêm tài khoản ngân hàng để nhận thanh toán
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm tài khoản đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
