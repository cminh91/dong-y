import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tài khoản - Dược phẩm Đông Y',
  description: 'Quản lý tài khoản cá nhân',
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {/* Account Layout - Full screen without header/footer */}
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
