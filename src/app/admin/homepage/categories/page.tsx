'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { CategoryWithChildren, SystemSetting } from '@/types/api';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCategories from '@/components/home/ProductCategories';

const CategoriesAdminPage: FC = () => {
  const [allCategories, setAllCategories] = useState<CategoryWithChildren[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<CategoryWithChildren[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const toast = ({ title, description }: { title: string; description: string; variant?: string }) => {
    alert(`${title}: ${description}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const featured = allCategories.filter(cat => selectedCategoryIds.includes(cat.id));
    setFeaturedCategories(featured);
  }, [selectedCategoryIds, allCategories]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, featuredIdsRes] = await Promise.all([
        apiClient.getProductCategories({}),
        apiClient.getHomeCategoryProducts(),
      ]);

      let allCats: CategoryWithChildren[] = [];
      if (categoriesRes.success && categoriesRes.data) {
        allCats = categoriesRes.data;
        setAllCategories(allCats);
      } else {
        throw new Error('Không thể tải danh sách danh mục');
      }
      
      let featuredIds: string[] = [];
      if (featuredIdsRes.success && featuredIdsRes.data) {
        featuredIds = featuredIdsRes.data;
        setSelectedCategoryIds(featuredIds);
      }
      
      const featured = allCats.filter(cat => featuredIds.includes(cat.id));
      setFeaturedCategories(featured);

    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tải dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (categoryId: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiClient.updateHomeCategoryProducts(selectedCategoryIds);
      
      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật danh mục nổi bật',
        });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi lưu dữ liệu',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="manage" className="w-full p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục Nổi bật</h1>
          <p className="text-gray-600 mt-2">
            Chọn các danh mục sản phẩm sẽ được hiển thị trên trang chủ.
          </p>
        </div>
        <div className="flex items-center gap-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manage">Quản lý</TabsTrigger>
                <TabsTrigger value="preview">Xem trước</TabsTrigger>
            </TabsList>
            <Button asChild variant="outline">
                <Link href="/admin/homepage">
                    <i className="fas fa-arrow-left mr-2"></i>
                    Quay lại
                </Link>
            </Button>
        </div>
      </div>

      <TabsContent value="manage">
        <Card>
          <CardHeader>
            <CardTitle>Chọn Danh mục</CardTitle>
            <CardDescription>
              Tích vào các ô để chọn danh mục bạn muốn làm nổi bật.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-6">
                {allCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategoryIds.includes(category.id)}
                      onCheckedChange={() => handleSelectionChange(category.id)}
                    />
                    <Label htmlFor={category.id} className="font-medium">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
              <Button type="submit">
                <i className="fas fa-save mr-2"></i>
                Lưu thay đổi
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="preview">
        <Card>
            <CardHeader>
                <CardTitle>Xem trước</CardTitle>
                <CardDescription>Đây là cách phần danh mục sẽ hiển thị trên trang chủ.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProductCategories categoriesData={featuredCategories} />
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CategoriesAdminPage;