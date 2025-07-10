"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLayoutData } from "@/hooks/useLayoutData";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { layoutData, loading, error } = useLayoutData();

  // Các trang không cần header/footer
  const noLayoutPages = [
    "/admin",
    "/tai-khoan",
    "/dang-nhap",
    "/dang-ky",
    "/dang-ky-thanh-cong"
  ];

  // Kiểm tra nếu pathname bắt đầu với bất kỳ path nào trong danh sách
  const shouldHideLayout = noLayoutPages.some(path => pathname.startsWith(path));

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Header
        productCategories={layoutData.productCategories}
        blogCategories={layoutData.postCategories}
        contactInfo={layoutData.contactInfo}
        loading={loading}
        error={error}
      />
      {children}
      <Footer
        productCategories={layoutData.productCategories}

        contactInfo={layoutData.contactInfo}
        loading={loading}
        error={error}
      />
    </>
  );
}