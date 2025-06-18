"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { loginAction } from "@/lib/auth-actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = (email: string, password: string): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!email) {
      newErrors.email = "Email là bắt buộc";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setApiError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!validateForm(email, password)) {
      setLoading(false);
      return;
    }

    try {
      await loginAction(formData);
      toast.success("Đăng nhập thành công");
    } catch (error) {
      console.error("Login error:", error);
      setApiError(error instanceof Error ? error.message : "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {apiError && (
        <Alert variant="destructive" className="bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {apiError}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="example@email.com"
            required
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
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

        <Button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </Button>
      </form>

      <div className="text-center text-sm">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="font-medium text-green-700 hover:text-green-800">
          Đăng ký
        </Link>
      </div>
    </div>
  );
}