"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Check, Upload, Camera, Eye, EyeOff } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export function RegisterForm() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null)
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null)
  
  const formRef = useRef<HTMLFormElement>(null)

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleFileChange = (side: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (side === "front") {
          setFrontImagePreview(event.target?.result as string)
        } else {
          setBackImagePreview(event.target?.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step < 3) {
      nextStep()
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              step >= 1 ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            {step > 1 ? <Check className="h-5 w-5" /> : "1"}
          </div>
          <div
            className={`h-1 flex-1 ${step >= 2 ? "bg-green-600" : "bg-gray-200"}`}
          ></div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              step >= 2 ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            {step > 2 ? <Check className="h-5 w-5" /> : "2"}
          </div>
          <div
            className={`h-1 flex-1 ${step >= 3 ? "bg-green-600" : "bg-gray-200"}`}
          ></div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              step >= 3 ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            3
          </div>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span
            className={step >= 1 ? "font-medium text-green-600" : "text-gray-500"}
          >
            Thông tin cá nhân
          </span>
          <span
            className={step >= 2 ? "font-medium text-green-600" : "text-gray-500"}
          >
            CCCD/CMND
          </span>
          <span
            className={step >= 3 ? "font-medium text-green-600" : "text-gray-500"}
          >
            Tài khoản ngân hàng
          </span>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên đầy đủ *</Label>
                <Input id="fullName" name="fullName" placeholder="Nguyễn Văn A" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                <Input id="phoneNumber" name="phoneNumber" placeholder="0912345678" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Input id="address" name="address" placeholder="123 Đường ABC, Quận XYZ, TP.HCM" required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" placeholder="example@email.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode">Mã giới thiệu</Label>
                <Input id="referralCode" name="referralCode" placeholder="Nhập mã giới thiệu (nếu có)" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idCardNumber">Số CCCD/CMND *</Label>
              <Input id="idCardNumber" name="idCardNumber" placeholder="079123456789" required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu *</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent">Chọn đại lý/KTV (nếu có)</Label>
              <Select name="agent">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đại lý/KTV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  <SelectItem value="agent1">Đại lý Đông Y Hà Nội</SelectItem>
                  <SelectItem value="agent2">Đại lý Đông Y TP. HCM</SelectItem>
                  <SelectItem value="agent3">Đại lý Đông Y Đà Nẵng</SelectItem>
                  <SelectItem value="ktv1">KTV Nguyễn Văn A</SelectItem>
                  <SelectItem value="ktv2">KTV Trần Thị B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: ID Card Upload */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">CCCD/CMND mặt trước</h3>
                    <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                      {frontImagePreview ? (
                        <div className="relative h-full w-full">
                          <img
                            src={frontImagePreview}
                            alt="CCCD mặt trước"
                            className="h-full w-full rounded object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => setFrontImagePreview(null)}
                          >
                            Xóa
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2 text-center">
                          <Upload className="h-10 w-10 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Kéo thả hoặc nhấp để tải lên
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        id="frontImage"
                        name="frontImage"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange("front", e)}
                      />
                    </div>
                    <Tabs defaultValue="upload">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Tải lên</TabsTrigger>
                        <TabsTrigger value="camera">Chụp ảnh</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() => document.getElementById("frontImage")?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" /> Chọn ảnh
                        </Button>
                      </TabsContent>
                      <TabsContent value="camera">
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 w-full"
                        >
                          <Camera className="mr-2 h-4 w-4" /> Mở camera
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">CCCD/CMND mặt sau</h3>
                    <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                      {backImagePreview ? (
                        <div className="relative h-full w-full">
                          <img
                            src={backImagePreview}
                            alt="CCCD mặt sau"
                            className="h-full w-full rounded object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => setBackImagePreview(null)}
                          >
                            Xóa
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2 text-center">
                          <Upload className="h-10 w-10 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Kéo thả hoặc nhấp để tải lên
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        id="backImage"
                        name="backImage"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange("back", e)}
                      />
                    </div>
                    <Tabs defaultValue="upload">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Tải lên</TabsTrigger>
                        <TabsTrigger value="camera">Chụp ảnh</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() => document.getElementById("backImage")?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" /> Chọn ảnh
                        </Button>
                      </TabsContent>
                      <TabsContent value="camera">
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 w-full"
                        >
                          <Camera className="mr-2 h-4 w-4" /> Mở camera
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Bank Account Information */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">Tên ngân hàng</Label>
                <Select name="bankName">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngân hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vietcombank">Vietcombank</SelectItem>
                    <SelectItem value="vietinbank">Vietinbank</SelectItem>
                    <SelectItem value="bidv">BIDV</SelectItem>
                    <SelectItem value="agribank">Agribank</SelectItem>
                    <SelectItem value="techcombank">Techcombank</SelectItem>
                    <SelectItem value="mbbank">MB Bank</SelectItem>
                    <SelectItem value="tpbank">TPBank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Số tài khoản</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Chi nhánh</Label>
              <Input
                id="branch"
                name="branch"
                placeholder="Chi nhánh Quận 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Số thẻ (nếu có)</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Tên chủ tài khoản</Label>
              <Input
                id="accountName"
                name="accountName"
                placeholder="NGUYEN VAN A"
              />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-green-700 hover:bg-green-800"
            >
              Tiếp theo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-green-700 hover:bg-green-800"
            >
              Đăng ký <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {step === 1 && (
        <div className="text-center text-sm">
          Đã có tài khoản?{" "}
          <Link href="/dang-nhap" className="font-medium text-green-700 hover:text-green-800">
            Đăng nhập
          </Link>
        </div>
      )}
    </div>
  )
}