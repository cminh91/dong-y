'use client';

import { FC, useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/types/api';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

const FeaturedProductsAdminPage: FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isPending, startTransition] = useTransition();

  const toast = ({ title, description }: { title: string; description: string; variant?: string }) => {
    alert(`${title}: ${description}`);
  };

  const fetchAllProducts = async (search: string) => {
    try {
      const productsRes = await apiClient.getProducts({ search, limit: 1000 }); // Lấy nhiều sản phẩm
      if (productsRes.success && productsRes.data) {
        setAllProducts(productsRes.data.products);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách sản phẩm',
        variant: 'destructive',
      });
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const featuredRes = await apiClient.getFeaturedProducts({ limit: 100 });
      if (featuredRes.success && featuredRes.data) {
        setFeaturedProducts(featuredRes.data);
        setSelectedProductIds(new Set(featuredRes.data.map(p => p.id)));
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải sản phẩm nổi bật',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAllProducts(debouncedSearchTerm),
        fetchFeaturedProducts()
      ]);
      setLoading(false);
    };
    fetchData();
  }, [debouncedSearchTerm]);

  const handleSelectionChange = (productId: string, isSelected: boolean) => {
    startTransition(async () => {
      try {
        const response = isSelected
          ? await apiClient.setFeaturedProduct(productId, true)
          : await apiClient.removeFeaturedProduct(productId);

        if (response.success) {
          toast({
            title: 'Thành công',
            description: `Đã ${isSelected ? 'thêm' : 'xóa'} sản phẩm nổi bật.`,
          });
          // Cập nhật lại cả hai danh sách để phản ánh thay đổi
          await fetchFeaturedProducts();
        } else {
          throw new Error(response.error || 'Thao tác thất bại');
        }
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Có lỗi xảy ra',
          variant: 'destructive',
        });
      }
    });
  };
  
  // Cập nhật danh sách xem trước khi lựa chọn thay đổi
  useEffect(() => {
    const updatedPreview = allProducts.filter(p => selectedProductIds.has(p.id));
    setFeaturedProducts(updatedPreview);
  }, [selectedProductIds, allProducts]);


  if (loading && allProducts.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm Nổi bật</h1>
          <p className="text-gray-600 mt-2">
            Chọn các sản phẩm sẽ được hiển thị trên trang chủ.
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
            <CardTitle>Chọn Sản phẩm</CardTitle>
            <CardDescription>
              Tích vào các ô để chọn sản phẩm bạn muốn làm nổi bật. Thay đổi sẽ được lưu tự động.
            </CardDescription>
             <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                {(loading || isPending) && <p>Đang cập nhật...</p>}
                {allProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={product.id}
                      checked={selectedProductIds.has(product.id)}
                      onCheckedChange={(checked) => handleSelectionChange(product.id, !!checked)}
                      disabled={isPending}
                    />
                    <Label htmlFor={product.id} className="font-medium">
                      {product.name}
                    </Label>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="preview">
        <Card>
            <CardHeader>
                <CardTitle>Xem trước</CardTitle>
                <CardDescription>Đây là cách phần sản phẩm nổi bật sẽ hiển thị trên trang chủ.</CardDescription>
            </CardHeader>
            <CardContent>
                <FeaturedProducts productsData={featuredProducts} />
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default FeaturedProductsAdminPage;
