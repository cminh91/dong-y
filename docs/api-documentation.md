# API Documentation - Home Page Components

Tài liệu này mô tả các API mới được tạo để quản lý nội dung trang chủ dựa trên Prisma schema.

## Tổng quan

Các API được thiết kế để quản lý nội dung động của trang chủ thông qua model `SystemSetting` trong Prisma. Mỗi thành phần trang chủ có một category riêng trong `SystemSetting`.

## Danh sách API

### 1. Homepage Data API (`/api/homepage-data`)
API tổng hợp để lấy tất cả dữ liệu cần thiết cho trang chủ.

#### GET - Lấy tất cả dữ liệu trang chủ
```
GET /api/homepage-data?includeProducts=true&includeCategories=true&includePosts=true&includeFaqs=true
```

**Query Parameters:**
- `includeProducts` (boolean): Bao gồm sản phẩm nổi bật
- `includeCategories` (boolean): Bao gồm danh mục sản phẩm
- `includePosts` (boolean): Bao gồm bài viết mới nhất
- `includeFaqs` (boolean): Bao gồm FAQs phổ biến

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "hero-section": { "title": "...", "subtitle": "..." },
      "about-section": { "content": "..." },
      "benefits-section": { "benefits": [...] },
      "testimonials-section": { "testimonials": [...] },
      "contact-section": { "phone": "...", "email": "..." }
    },
    "featuredProducts": [...],
    "categories": [...],
    "latestPosts": [...],
    "popularFaqs": [...]
  }
}
```

#### POST - Cập nhật nhiều settings cùng lúc
```json
{
  "settings": {
    "hero-section": {
      "title": "Welcome to Our Store",
      "subtitle": "Best products for you"
    },
    "about-section": {
      "content": "We are a leading pharmacy..."
    }
  }
}
```

#### PUT - Cập nhật một setting cụ thể
```json
{
  "category": "hero-section",
  "key": "title",
  "value": "New Title",
  "description": "Main hero title"
}
```

### 2. Hero Sections API (`/api/hero-sections`)
Quản lý hero section của trang chủ.

#### Các endpoints:
- `GET /api/hero-sections` - Lấy tất cả hero sections
- `POST /api/hero-sections` - Tạo hero section mới
- `PUT /api/hero-sections` - Cập nhật hero section
- `DELETE /api/hero-sections` - Xóa hero section

### 3. About Sections API (`/api/about-sections`)
Quản lý phần giới thiệu.

### 4. Benefits Sections API (`/api/benefits-sections`)
Quản lý phần lợi ích/đặc điểm.

### 5. Testimonials Sections API (`/api/testimonials-sections`)
Quản lý testimonials/đánh giá khách hàng.

### 6. Contact Sections API (`/api/contact-sections`)
Quản lý thông tin liên hệ.

### 7. Featured Products API (`/api/featured-products-new`)
Quản lý sản phẩm nổi bật dựa trên model `Product` trong Prisma.

#### GET - Lấy sản phẩm nổi bật
```
GET /api/featured-products-new?limit=8&offset=0
```

#### POST - Đặt sản phẩm làm nổi bật
```json
{
  "productId": "product_id",
  "isFeatured": true
}
```

### 8. Product Categories API (`/api/product-categories-new`)
Quản lý danh mục sản phẩm dựa trên model `Category`.

#### GET - Lấy danh mục sản phẩm
```
GET /api/product-categories-new?includeProducts=true&rootOnly=true&limit=8
```

### 9. Posts Sections API (`/api/posts-sections`)
Quản lý bài viết dựa trên model `Post`.

### 10. FAQs Sections API (`/api/faqs-sections`)
Quản lý FAQs dựa trên model `FAQ`.

## Cách sử dụng với API Client

```typescript
import { apiClient } from '@/lib/api-client';

// Lấy tất cả dữ liệu trang chủ
const homepageData = await apiClient.getHomepageData({
  includeProducts: true,
  includeCategories: true,
  includePosts: true,
  includeFaqs: true
});

// Cập nhật hero section
await apiClient.updateHeroSection({
  id: 'setting_id',
  value: {
    title: 'New Hero Title',
    subtitle: 'New Hero Subtitle',
    buttonText: 'Shop Now'
  }
});

// Lấy sản phẩm nổi bật
const featuredProducts = await apiClient.getFeaturedProducts({
  limit: 8
});

// Đặt sản phẩm làm nổi bật
await apiClient.setFeaturedProduct('product_id', true);
```

## Cấu trúc dữ liệu

### SystemSetting Structure
```json
{
  "id": "cuid",
  "key": "hero-section_title",
  "value": "Welcome to Our Store",
  "description": "Hero section main title",
  "category": "hero-section",
  "createdAt": "2025-06-21T...",
  "updatedAt": "2025-06-21T..."
}
```

### Product Structure (Featured Products)
```json
{
  "id": "cuid",
  "name": "Product Name",
  "slug": "product-slug",
  "description": "Product description",
  "price": 100000,
  "salePrice": 80000,
  "sku": "SKU001",
  "stock": 50,
  "images": {...},
  "isFeatured": true,
  "status": "ACTIVE",
  "category": {
    "id": "cuid",
    "name": "Category Name",
    "slug": "category-slug"
  }
}
```

### Category Structure
```json
{
  "id": "cuid",
  "name": "Category Name",
  "slug": "category-slug",
  "description": "Category description",
  "image": "category-image.jpg",
  "parentId": null,
  "status": "ACTIVE",
  "sortOrder": 0,
  "children": [...],
  "_count": {
    "products": 10,
    "children": 3
  }
}
```

## Error Handling

Tất cả API đều trả về cấu trúc response thống nhất:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Các mã lỗi phổ biến:
- `400 Bad Request` - Thiếu tham số bắt buộc
- `404 Not Found` - Không tìm thấy resource
- `409 Conflict` - Slug/key đã tồn tại
- `500 Internal Server Error` - Lỗi server

## Migration Notes

Để sử dụng các API này, bạn cần:

1. Đảm bảo Prisma schema đã được cập nhật
2. Chạy migration để tạo tables
3. Seed dữ liệu mẫu cho SystemSetting
4. Cập nhật components để sử dụng API thay vì static data

## Example Usage in Components

```typescript
// pages/index.tsx hoặc app/page.tsx
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { HomepageData } from '@/types/api';

export default function HomePage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getHomepageData();
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Error loading data</div>;

  return (
    <div>
      <HeroSection data={data.settings['hero-section']} />
      <AboutSection data={data.settings['about-section']} />
      <FeaturedProducts products={data.featuredProducts} />
      <ProductCategories categories={data.categories} />
      {/* ... other sections */}
    </div>
  );
}
```
