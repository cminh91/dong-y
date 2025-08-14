'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { PostCategory } from '@/types/api';
import PostCategoryForm from '@/components/admin/PostCategoryForm';

export default function PostCategoriesPage() {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PostCategory | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/post-categories?limit=100');
      const result = await response.json();
      
      if (result.success && result.data) {
        setCategories(result.data.categories || []);
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: PostCategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCategory(null);
    fetchCategories();
    toast.success(editingCategory ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục mới');
  };

  const handleDelete = async (categoryId: string, categoryName: string, postsCount: number) => {
    if (postsCount > 0) {
      toast.error(`Không thể xóa danh mục "${categoryName}" vì có ${postsCount} bài viết đang sử dụng.`);
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa danh mục "${categoryName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/post-categories/${categoryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Xóa danh mục thành công!');
        fetchCategories();
      } else {
        toast.error(data.error || 'Có lỗi xảy ra khi xóa danh mục');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Có lỗi xảy ra khi xóa danh mục');
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? (
      <Badge variant="default" className="bg-green-500">Hoạt động</Badge>
    ) : (
      <Badge variant="secondary">Không hoạt động</Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục Bài viết</h1>
          <p className="text-gray-600 mt-2">
            Quản lý các danh mục cho bài viết và tin tức.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleCreateCategory}>
            <i className="fas fa-plus mr-2"></i>
            Thêm danh mục
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/posts">
              <i className="fas fa-arrow-left mr-2"></i>
              Quay lại
            </Link>
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PostCategoryForm
              initialData={editingCategory ? {
                ...editingCategory,
                description: editingCategory.description || '',
                image: (editingCategory as any).image || '',
                sortOrder: (editingCategory as any).sortOrder || 0
              } : undefined}
              isEdit={!!editingCategory}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-folder-open text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-500 mb-4">Chưa có danh mục nào</p>
              <Button onClick={handleCreateCategory}>
                <i className="fas fa-plus mr-2"></i>
                Tạo danh mục đầu tiên
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Tên danh mục</th>
                    <th className="text-left py-3 px-4 font-medium">Slug</th>
                    <th className="text-left py-3 px-4 font-medium">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium">Số bài viết</th>
                    <th className="text-left py-3 px-4 font-medium">Thứ tự</th>
                    <th className="text-left py-3 px-4 font-medium">Ngày tạo</th>
                    <th className="text-right py-3 px-4 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {category.description.length > 100
                                ? `${category.description.substring(0, 100)}...`
                                : category.description
                              }
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(category.status)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {(category as any).postsCount || 0} bài viết
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{(category as any).sortOrder || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(category)}
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(category.id, category.name, (category as any).postsCount || 0)}
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
