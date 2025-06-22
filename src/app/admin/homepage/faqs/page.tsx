'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api-client';
import { FAQ } from '@/types/api';
import Link from 'next/link';

const FAQsAdmin: FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    sortOrder: 0,
    isActive: true
  });

  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    alert(`${title}: ${description}`);
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await apiClient.getFaqsSections({ limit: 100 });
      if (response.success) {
        setFaqs(response.data || []);
        // Extract unique categories
        const uniqueCategories = [...new Set((response.data || []).map(faq => faq.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu FAQs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        const response = await apiClient.updateFaqSection({
          id: isEditing,
          ...formData
        });
        
        if (response.success) {
          toast({
            title: 'Thành công',
            description: 'Đã cập nhật FAQ'
          });
          fetchFAQs();
          setIsEditing(null);
          resetForm();
        }
      } else {
        const response = await apiClient.createFaqSection(formData);
        
        if (response.success) {
          toast({
            title: 'Thành công',
            description: 'Đã tạo FAQ mới'
          });
          fetchFAQs();
          resetForm();
        }
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi lưu dữ liệu',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (faq: FAQ) => {
    setIsEditing(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sortOrder: faq.sortOrder,
      isActive: faq.isActive
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa FAQ này?')) return;
    
    try {
      const response = await apiClient.deleteFaqSection(id);
      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Đã xóa FAQ'
        });
        fetchFAQs();
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa FAQ',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await apiClient.updateFaqSection({
        id,
        isActive
      });
      
      if (response.success) {
        toast({
          title: 'Thành công',
          description: `FAQ đã được ${isActive ? 'kích hoạt' : 'tắt'}`
        });
        fetchFAQs();
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái FAQ',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      sortOrder: 0,
      isActive: true
    });
    setIsEditing(null);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý FAQs</h1>
          <p className="text-gray-600 mt-2">
            Quản lý câu hỏi thường gặp
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/homepage">
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng FAQs</CardTitle>
            <i className="fas fa-question-circle text-teal-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faqs.length}</div>
            <p className="text-xs text-muted-foreground">câu hỏi thường gặp</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <i className="fas fa-check-circle text-green-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {faqs.filter(faq => faq.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">FAQs đang hiển thị</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Danh mục</CardTitle>
            <i className="fas fa-folder text-blue-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">danh mục khác nhau</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tạm dừng</CardTitle>
            <i className="fas fa-pause-circle text-red-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {faqs.filter(faq => !faq.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">FAQs đã tắt</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Chỉnh sửa FAQ' : 'Thêm FAQ mới'}
            </CardTitle>
            <CardDescription>
              Thêm câu hỏi thường gặp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">Câu hỏi</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Làm thế nào để..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="answer">Câu trả lời</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Bạn có thể..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Sản phẩm, Đơn hàng..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sortOrder">Thứ tự</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Hiển thị công khai</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                  {isEditing ? 'Cập nhật' : 'Thêm mới'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <i className="fas fa-times mr-2"></i>
                    Hủy
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        {formData.question && formData.answer && (
          <Card>
            <CardHeader>
              <CardTitle>Xem trước</CardTitle>
              <CardDescription>
                Xem trước FAQ với dữ liệu hiện tại
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-lg">{formData.question}</h3>
                  <div className="flex items-center space-x-2">
                    {formData.category && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {formData.category}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      formData.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {formData.isActive ? 'Hiển thị' : 'Ẩn'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700">{formData.answer}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm và lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* FAQs List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách FAQs</CardTitle>
          <CardDescription>
            {filteredFAQs.length} / {faqs.length} FAQs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-question-circle text-4xl mb-4"></i>
              <p>
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Không tìm thấy FAQ nào' 
                  : 'Chưa có FAQ nào'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{faq.question}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          faq.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {faq.isActive ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {faq.answer}
                      </p>
                      <p className="text-xs text-gray-500">
                        Thứ tự: {faq.sortOrder} | Cập nhật: {new Date(faq.updatedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Switch
                        checked={faq.isActive}
                        onCheckedChange={(checked) => toggleActive(faq.id, checked)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(faq)}
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(faq.id)}
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQsAdmin;
