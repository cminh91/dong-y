"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Upload, Gift } from 'lucide-react'
import { toast } from "sonner"
import { registerAction } from "@/lib/auth-actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  referralCode?: string;
  idCardNumber?: string;
  frontIdImage?: string;
  backIdImage?: string;
  bankName?: string;
  accountNumber?: string;
  branch?: string;
  accountName?: string;
}

interface FormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  email: string;
  password: string;
  confirmPassword: string;
  idCardNumber: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  accountName: string;
}

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [role, setRole] = useState("CUSTOMER")
  const [referralCode, setReferralCode] = useState("")
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null)
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null)
  const [frontImageUrl, setFrontImageUrl] = useState<string | null>(null)
  const [backImageUrl, setBackImageUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)
  const [step, setStep] = useState(1);

  // State để lưu dữ liệu form qua các bước
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
    idCardNumber: '',
    bankName: '',
    accountNumber: '',
    branch: '',
    accountName: ''
  });

  // Lấy mã giới thiệu từ URL khi component mount
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
    }
  }, [searchParams])

  // Helper functions to validate each field
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Email không hợp lệ";
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Mật khẩu là bắt buộc";
    } else if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return "Xác nhận mật khẩu là bắt buộc";
    } else if (confirmPassword !== password) {
      return "Mật khẩu xác nhận không khớp";
    }
    return undefined;
  };

  const validateFullName = (fullName: string): string | undefined => {
    if (!fullName) {
      return "Họ tên là bắt buộc";
    }
    return undefined;
  };

  const validatePhoneNumber = (phoneNumber: string): string | undefined => {
    if (!phoneNumber) {
      return "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(phoneNumber)) {
      return "Số điện thoại không hợp lệ";
    }
    return undefined;
  };

  const validateAddress = (address: string): string | undefined => {
    if (!address) {
      return "Địa chỉ là bắt buộc";
    }
    return undefined;
  };

  const validateIdCardNumber = (idCardNumber: string): string | undefined => {
    if (!idCardNumber) {
      return "Số CMND/CCCD là bắt buộc";
    } else if (!/^[0-9]{9,12}$/.test(idCardNumber)) {
      return "Số CMND/CCCD không hợp lệ";
    }
    return undefined;
  };

  const validateBankName = (bankName: string): string | undefined => {
    if (!bankName) {
      return "Tên ngân hàng là bắt buộc";
    }
    return undefined;
  };

  const validateAccountNumber = (accountNumber: string): string | undefined => {
    if (!accountNumber) {
      return "Số tài khoản là bắt buộc";
    } else if (!/^[0-9]{10,16}$/.test(accountNumber)) {
      return "Số tài khoản không hợp lệ";
    }
    return undefined;
  };

  const validateBranch = (branch: string): string | undefined => {
    if (!branch) {
      return "Chi nhánh là bắt buộc";
    }
    return undefined;
  };

  const validateAccountName = (accountName: string): string | undefined => {
    if (!accountName) {
      return "Tên chủ tài khoản là bắt buộc";
    }
    return undefined;
  };

  // Helper để validate từng bước
  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      // Validate thông tin cá nhân (bắt buộc cho tất cả vai trò)
      newErrors.email = validateEmail(formData.email);
      newErrors.password = validatePassword(formData.password);
      newErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword, formData.password);
      newErrors.fullName = validateFullName(formData.fullName);
      newErrors.phoneNumber = validatePhoneNumber(formData.phoneNumber);
      newErrors.address = validateAddress(formData.address);

      if (newErrors.email) isValid = false;
      if (newErrors.password) isValid = false;
      if (newErrors.confirmPassword) isValid = false;
      if (newErrors.fullName) isValid = false;
      if (newErrors.phoneNumber) isValid = false;
      if (newErrors.address) isValid = false;

    } else if (currentStep === 2) {
      // Validate CCCD/CMND (bắt buộc cho tất cả vai trò)
      newErrors.idCardNumber = validateIdCardNumber(formData.idCardNumber);
      if (!frontImageUrl) {
        newErrors.frontIdImage = "Vui lòng tải lên ảnh CCCD mặt trước";
        isValid = false;
      }

      if (!backImageUrl) {
        newErrors.backIdImage = "Vui lòng tải lên ảnh CCCD mặt sau";
        isValid = false;
      }

      if (newErrors.idCardNumber) isValid = false;

    } else if (currentStep === 3) {
      // Validate thông tin ngân hàng (bắt buộc cho tất cả vai trò)
      newErrors.bankName = validateBankName(formData.bankName);
      newErrors.accountNumber = validateAccountNumber(formData.accountNumber);
      newErrors.branch = validateBranch(formData.branch);
      newErrors.accountName = validateAccountName(formData.accountName);

      if (newErrors.bankName) isValid = false;
      if (newErrors.accountNumber) isValid = false;
      if (newErrors.branch) isValid = false;
      if (newErrors.accountName) isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Helper để cập nhật form data
  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleFileChange = async (side: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      try {
        // Set uploading state
        setUploadingImage(side);

        // Preview image
        const reader = new FileReader();
        reader.onload = (event) => {
          if (side === "front") {
            setFrontImagePreview(event.target?.result as string);
          } else {
            setBackImagePreview(event.target?.result as string);
          }
        };
        reader.readAsDataURL(file);

        // Upload image using Cloudinary API
        const uploadFormData = new FormData();
        uploadFormData.append('files', file);
        uploadFormData.append('folder', 'id-cards'); // Organize in id-cards folder

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const result = await response.json();

        if (result.success && result.data.files.length > 0) {
          // Store the uploaded image URL from Cloudinary
          const uploadedFile = result.data.files[0];
          if (side === "front") {
            setFrontImageUrl(uploadedFile.secure_url);
          } else {
            setBackImageUrl(uploadedFile.secure_url);
          }
          toast.success("Ảnh đã được tải lên Cloudinary thành công");
        } else {
          toast.error(result.error || "Lỗi khi tải ảnh lên Cloudinary");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");

        // Clear preview if upload failed
        if (side === "front") {
          setFrontImagePreview(null);
        } else {
          setBackImagePreview(null);
        }
      } finally {
        setUploadingImage(null);
      }
    }
  };

  // Submit form ở bước cuối
  const handleStepSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Nếu chưa phải bước cuối, validate và chuyển bước tiếp theo
    if (step < 3) {
      // Validate step hiện tại, nếu ok thì next step
      if (validateStep(step)) {
        setStep(step + 1);
      }
      return;
    }

    // Bước cuối (step 3): validate toàn bộ và submit
    setLoading(true);
    setErrors({});
    try {
      // Validate tất cả các bước trước khi submit
      let valid = true;
      for (let s = 1; s <= 3; s++) {
        if (!validateStep(s)) {
          valid = false;
          setStep(s);
          break;
        }
      }
      if (!valid) {
        setLoading(false);
        return;
      }
        // Tạo FormData từ state để gửi tất cả thông tin
      const submitFormData = new FormData();
      submitFormData.append("role", role);
      submitFormData.append("fullName", formData.fullName);
      submitFormData.append("phoneNumber", formData.phoneNumber);
      submitFormData.append("address", formData.address);
      submitFormData.append("email", formData.email);
      submitFormData.append("password", formData.password);
      submitFormData.append("confirmPassword", formData.confirmPassword);
      submitFormData.append("idCardNumber", formData.idCardNumber);
      submitFormData.append("bankName", formData.bankName);
      submitFormData.append("accountNumber", formData.accountNumber);
      submitFormData.append("branch", formData.branch);
      submitFormData.append("accountName", formData.accountName);

      // Add referral code if exists
      if (referralCode) {
        submitFormData.append("referralCode", referralCode);
      }

      if (frontImageUrl) submitFormData.append("frontIdImage", frontImageUrl);
      if (backImageUrl) submitFormData.append("backIdImage", backImageUrl);

      const result = await registerAction(submitFormData);
      console.log("Registration result:", result);

      if (result.success) {
        toast.success("Đăng ký thành công!");
        router.push("/dang-ky-thanh-cong");
      } else {
        // Hiển thị lỗi validation trên form
        if (result.field) {
          setErrors({ [result.field]: result.error });
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Đăng ký tài khoản
        </h1>
        <p className="text-sm text-muted-foreground">
          Điền thông tin để tạo tài khoản mới
        </p>
      </div>

      {/* Hiển thị thông tin mã giới thiệu nếu có */}
      {referralCode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Bạn được giới thiệu bởi mã: <span className="font-mono">{referralCode}</span>
              </p>
              <p className="text-xs text-green-600">
                Bạn sẽ được hưởng các ưu đãi đặc biệt khi đăng ký!
              </p>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleStepSubmit} className="space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`h-2 w-2 rounded-full ${step===1?"bg-green-700":"bg-gray-300"}`}></div>
          <div className={`h-2 w-2 rounded-full ${step===2?"bg-green-700":"bg-gray-300"}`}></div>
          <div className={`h-2 w-2 rounded-full ${step===3?"bg-green-700":"bg-gray-300"}`}></div>
        </div>
        {/* Step 1: Thông tin cá nhân */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
                  <SelectItem value="STAFF">Nhân viên</SelectItem>
                  <SelectItem value="COLLABORATOR">Cộng tác viên</SelectItem>
                  <SelectItem value="AGENT">Đại lý</SelectItem>
                </SelectContent>
              </Select>
            </div>            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Nguyễn Văn A"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleFormChange('fullName', e.target.value)}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="0912345678"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                required
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  required
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
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
                    value={formData.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
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
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? "border-red-500" : ""}
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
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>
        )}        {/* Step 2: CCCD/CMND */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">CCCD/CMND</h3>

            <div className="space-y-2">
              <Label htmlFor="idCardNumber">Số CCCD/CMND *</Label>
              <Input
                id="idCardNumber"
                name="idCardNumber"
                placeholder="079123456789"
                required
                value={formData.idCardNumber}
                onChange={(e) => handleFormChange('idCardNumber', e.target.value)}
                className={errors.idCardNumber ? "border-red-500" : ""}
              />
              {errors.idCardNumber && (
                <p className="text-sm text-red-500">{errors.idCardNumber}</p>
              )}
            </div>            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Label>CCCD/CMND mặt trước *</Label>
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
                        onClick={() => {
                          setFrontImagePreview(null)
                          setFrontImageUrl(null)
                        }}
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("frontImage")?.click()}
                  disabled={uploadingImage === "front"}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingImage === "front" ? "Đang tải lên..." : "Chọn ảnh"}
                </Button>
                {errors.frontIdImage && (
                  <p className="text-sm text-red-500">{errors.frontIdImage}</p>
                )}
              </div>              <div className="space-y-4">
                <Label>CCCD/CMND mặt sau *</Label>
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
                        onClick={() => {
                          setBackImagePreview(null)
                          setBackImageUrl(null)
                        }}
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("backImage")?.click()}
                  disabled={uploadingImage === "back"}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingImage === "back" ? "Đang tải lên..." : "Chọn ảnh"}
                </Button>
                {errors.backIdImage && (
                  <p className="text-sm text-red-500">{errors.backIdImage}</p>
                )}
              </div>
            </div>
          </div>
        )}        {/* Step 3: Ngân hàng */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin ngân hàng</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">Tên ngân hàng *</Label>
                <Select name="bankName" required value={formData.bankName} onValueChange={(value) => handleFormChange('bankName', value)}>
                  <SelectTrigger className={errors.bankName ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn ngân hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIETCOMBANK">Vietcombank</SelectItem>
                    <SelectItem value="VIETINBANK">Vietinbank</SelectItem>
                    <SelectItem value="BIDV">BIDV</SelectItem>
                    <SelectItem value="AGRIBANK">Agribank</SelectItem>
                    <SelectItem value="TECHCOMBANK">Techcombank</SelectItem>
                    <SelectItem value="MBBANK">MB Bank</SelectItem>
                    <SelectItem value="TPBANK">TPBank</SelectItem>
                  </SelectContent>
                </Select>
                {errors.bankName && (
                  <p className="text-sm text-red-500">{errors.bankName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Số tài khoản *</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  placeholder="1234567890"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => handleFormChange('accountNumber', e.target.value)}
                  className={errors.accountNumber ? "border-red-500" : ""}
                />
                {errors.accountNumber && (
                  <p className="text-sm text-red-500">{errors.accountNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Chi nhánh *</Label>
              <Input
                id="branch"
                name="branch"
                placeholder="Chi nhánh Quận 1"
                required
                value={formData.branch}
                onChange={(e) => handleFormChange('branch', e.target.value)}
                className={errors.branch ? "border-red-500" : ""}
              />
              {errors.branch && (
                <p className="text-sm text-red-500">{errors.branch}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Tên chủ tài khoản *</Label>
              <Input
                id="accountName"
                name="accountName"
                placeholder="NGUYEN VAN A"
                required
                value={formData.accountName}
                onChange={(e) => handleFormChange('accountName', e.target.value)}
                className={errors.accountName ? "border-red-500" : ""}
              />
              {errors.accountName && (<p className="text-sm text-red-500">{errors.accountName}</p>
              )}
            </div>
          </div>
        )}

        {/* Nút điều hướng bước */}
        <div className="flex gap-2">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step-1)}>
              Quay lại
            </Button>
          )}
          {step < 3 && (
            <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={loading}>
              Tiếp tục
            </Button>
          )}
          {step === 3 && (
            <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          )}
        </div>
      </form>

      <div className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="font-medium text-green-700 hover:text-green-800">
          Đăng nhập
        </Link>
      </div>
    </div>
  )
}
