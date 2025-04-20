import { Roboto, Poppins } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Không dùng usePathname ở server component
  // Có thể truyền props hoặc dùng logic khác ở component con nếu cần phân biệt admin
  // const isAdminPage = ...;
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.2.0/css/all.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css" />
      </head>
      <body className={`${roboto.variable} ${poppins.variable} antialiased`}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/trongdong.png"
          alt="Trống đồng"
          loading="eager"
          className="fixed top-1/2 right-0 translate-y-[-50%] translate-x-1/2 w-[30rem] md:w-[50rem] opacity-90 pointer-events-none z-[-10] slow-spin"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/vn.png"
          alt="Decorative"
          loading="eager"
          className="fixed top-1/5 left-45 translate-y-[-25%] -translate-x-1/2 w-[25rem] sm:w-[20rem] md:w-[30rem] opacity-20 pointer-events-none z-0 md:left-55"
        />
      </body>
    </html>
  );
}
