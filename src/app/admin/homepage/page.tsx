import { FC } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HomepageAdmin: FC = () => {
  const sections = [
    {
      title: 'Hero Section',
      description: 'Quản lý banner chính, tiêu đề và call-to-action của trang chủ',
      icon: 'fas fa-image',
      href: '/admin/homepage/hero',
      color: 'bg-blue-500'
    },
    {
      title: 'Giới thiệu',
      description: 'Quản lý nội dung phần giới thiệu công ty',
      icon: 'fas fa-info-circle',
      href: '/admin/homepage/about',
      color: 'bg-green-500'
    },
    {
      title: 'Lợi ích',
      description: 'Quản lý các lợi ích và đặc điểm nổi bật',
      icon: 'fas fa-star',
      href: '/admin/homepage/benefits',
      color: 'bg-yellow-500'
    },
    {
      title: 'Đánh giá khách hàng',
      description: 'Quản lý testimonials và đánh giá từ khách hàng',
      icon: 'fas fa-quote-left',
      href: '/admin/homepage/testimonials',
      color: 'bg-purple-500'
    },
    {
      title: 'Thông tin liên hệ',
      description: 'Quản lý thông tin liên hệ hiển thị trên trang chủ',
      icon: 'fas fa-phone',
      href: '/admin/homepage/contact',
      color: 'bg-pink-500'
    },
    {
      title: 'Sản phẩm nổi bật',
      description: 'Quản lý danh sách sản phẩm được đề xuất',
      icon: 'fas fa-trophy',
      href: '/admin/homepage/featured-products',
      color: 'bg-orange-500'
    },
    {
      title: 'Danh mục sản phẩm',
      description: 'Quản lý danh mục hiển thị trên trang chủ',
      icon: 'fas fa-th-large',
      href: '/admin/homepage/categories',
      color: 'bg-indigo-500'
    },
    {
      title: 'Bài viết mới',
      description: 'Quản lý bài viết mới nhất hiển thị trên trang chủ',
      icon: 'fas fa-newspaper',
      href: '/admin/homepage/posts',
      color: 'bg-red-500'
    },
    {
      title: 'FAQ',
      description: 'Quản lý câu hỏi thường gặp',
      icon: 'fas fa-question-circle',
      href: '/admin/homepage/faqs',
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý trang chủ</h1>
          <p className="text-gray-600 mt-2">
            Quản lý tất cả nội dung và thành phần hiển thị trên trang chủ
          </p>
        </div>
        <Button asChild>
          <Link href="/" target="_blank">
            <i className="fas fa-external-link-alt mr-2"></i>
            Xem trang chủ
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hero Sections</CardTitle>
            <i className="fas fa-image text-blue-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">sections đang hoạt động</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm nổi bật</CardTitle>
            <i className="fas fa-trophy text-orange-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">sản phẩm được đề xuất</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
            <i className="fas fa-quote-left text-purple-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">đánh giá khách hàng</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FAQ</CardTitle>
            <i className="fas fa-question-circle text-teal-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">câu hỏi thường gặp</p>
          </CardContent>
        </Card>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center text-white`}>
                  <i className={section.icon}></i>
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="mt-2">
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={section.href}>
                  <i className="fas fa-edit mr-2"></i>
                  Quản lý
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>
            Các thao tác thường dùng để quản lý trang chủ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/homepage/preview">
                <i className="fas fa-eye mr-2"></i>
                Xem trước trang chủ
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/homepage/backup">
                <i className="fas fa-download mr-2"></i>
                Sao lưu nội dung
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/homepage/restore">
                <i className="fas fa-upload mr-2"></i>
                Khôi phục nội dung
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomepageAdmin;
