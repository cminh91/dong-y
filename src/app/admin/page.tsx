"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  // Sử dụng client-side redirect thay vì server-side redirect
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Đang chuyển hướng đến trang Dashboard...</p>
    </div>
  );
}