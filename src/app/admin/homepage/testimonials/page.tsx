'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { SystemSetting } from '@/types/api';
import Link from 'next/link';
import Image from 'next/image';
import { uploadImageAction } from '@/lib/upload-actions';

interface TestimonialData {
  name: string;
  position: string;
  company: string;
  testimonial: string;
  avatar: string;
  rating: number;
  location: string;
  verified: boolean;
}

const TestimonialsAdmin = () => {
  const [testimonials, setTestimonials] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestimonialData>({
    name: '',
    position: '',
    company: '',
    testimonial: '',
    avatar: '',
    rating: 5,
    location: '',
    verified: true
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);


  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    alert(`${title}: ${description}`);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await apiClient.getTestimonialsSections();
      if (response.success) {
        setTestimonials(response.data || []);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu testimonials',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, avatar: previewUrl });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let avatarUrl = formData.avatar;

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const response = await uploadImageAction(formData);
        if (response.success && response.url) {
          avatarUrl = response.url;
        } else {
          throw new Error('Lỗi khi tải ảnh lên');
        }
      }

      const finalData = { ...formData, avatar: avatarUrl };

      if (isEditing) {
        const response = await apiClient.updateTestimonialsSection({
          id: isEditing,
          value: finalData
        });
        
        if (response.success) {
          toast({
            title: 'Thành công',
            description: 'Đã cập nhật testimonial'
          });
          fetchTestimonials();
          setIsEditing(null);
          resetForm();
        }
      } else {
        const response = await apiClient.createTestimonialsSection({
          key: `testimonial_${Date.now()}`,
          value: finalData,
          description: 'Customer testimonial'
        });
        
        if (response.success) {
          toast({
            title: 'Thành công',
            description: 'Đã tạo testimonial mới'
          });
          fetchTestimonials();
          resetForm();
        }
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu dữ liệu',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (testimonial: SystemSetting) => {
    setIsEditing(testimonial.id);
    setFormData(testimonial.value as TestimonialData);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa testimonial này?')) return;
    
    try {
      const response = await apiClient.deleteTestimonialsSection(id);
      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Đã xóa testimonial'
        });
        fetchTestimonials();
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa testimonial',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      company: '',
      testimonial: '',
      avatar: '',
      rating: 5,
      location: '',
      verified: true
    });
    setAvatarFile(null);
    setIsEditing(null);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`fas fa-star ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      ></i>
    ));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Testimonials</h1>
          <p className="text-gray-600 mt-2">
            Quản lý đánh giá và phản hồi từ khách hàng
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
            <CardTitle className="text-sm font-medium">Tổng testimonials</CardTitle>
            <i className="fas fa-quote-left text-purple-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimonials.length}</div>
            <p className="text-xs text-muted-foreground">đánh giá khách hàng</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xác minh</CardTitle>
            <i className="fas fa-check-circle text-green-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testimonials.filter(t => t.value?.verified).length}
            </div>
            <p className="text-xs text-muted-foreground">testimonials đã xác minh</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá trung bình</CardTitle>
            <i className="fas fa-star text-yellow-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testimonials.length > 0 
                ? (testimonials.reduce((acc, t) => acc + (t.value?.rating || 0), 0) / testimonials.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p className="text-xs text-muted-foreground">sao trung bình</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">5 sao</CardTitle>
            <i className="fas fa-trophy text-orange-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testimonials.filter(t => t.value?.rating === 5).length}
            </div>
            <p className="text-xs text-muted-foreground">đánh giá 5 sao</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Chỉnh sửa Testimonial' : 'Thêm Testimonial mới'}
            </CardTitle>
            <CardDescription>
              Thêm đánh giá từ khách hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên khách hàng</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="position">Chức vụ</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Giám đốc"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Công ty</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="ABC Company"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Địa điểm</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Hà Nội"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="testimonial">Nội dung đánh giá</Label>
                <Textarea
                  id="testimonial"
                  value={formData.testimonial}
                  onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                  placeholder="Sản phẩm rất tốt, tôi rất hài lòng..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="avatar">Ảnh đại diện</Label>
                <Input
                  id="avatar"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                {formData.avatar && (
                  <div className="mt-2">
                    <Image 
                      src={formData.avatar} 
                      alt="Avatar preview" 
                      width={80} 
                      height={80} 
                      className="rounded-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Đánh giá</Label>
                  <Select 
                    value={formData.rating.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đánh giá" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 sao - Xuất sắc</SelectItem>
                      <SelectItem value="4">4 sao - Tốt</SelectItem>
                      <SelectItem value="3">3 sao - Trung bình</SelectItem>
                      <SelectItem value="2">2 sao - Kém</SelectItem>
                      <SelectItem value="1">1 sao - Rất kém</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="verified">Trạng thái</Label>
                  <Select 
                    value={formData.verified.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, verified: value === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Đã xác minh</SelectItem>
                      <SelectItem value="false">Chưa xác minh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" disabled={uploading}>
                  {uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                      {isEditing ? 'Cập nhật' : 'Thêm mới'}
                    </>
                  )}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm} disabled={uploading}>
                    <i className="fas fa-times mr-2"></i>
                    Hủy
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        {formData.name && formData.testimonial && (
          <Card>
            <CardHeader>
              <CardTitle>Xem trước</CardTitle>
              <CardDescription>
                Xem trước testimonial với dữ liệu hiện tại
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {formData.avatar ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden relative">
                        <Image
                          src={formData.avatar}
                          alt={formData.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <i className="fas fa-user text-gray-600"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex space-x-1">
                        {renderStars(formData.rating)}
                      </div>
                      {formData.verified && (
                        <i className="fas fa-check-circle text-blue-500 text-sm"></i>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3 italic">"{formData.testimonial}"</p>
                    <div>
                      <p className="font-medium text-gray-900">{formData.name}</p>
                      {formData.position && formData.company && (
                        <p className="text-sm text-gray-600">
                          {formData.position} tại {formData.company}
                        </p>
                      )}
                      {formData.location && (
                        <p className="text-sm text-gray-500">{formData.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Existing Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials hiện có</CardTitle>
          <CardDescription>
            Danh sách tất cả testimonials đã tạo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testimonials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-quote-left text-4xl mb-4"></i>
              <p>Chưa có testimonial nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{testimonial.value?.name}</h3>
                        <div className="flex space-x-1">
                          {renderStars(testimonial.value?.rating || 0)}
                        </div>
                        {testimonial.value?.verified && (
                          <i className="fas fa-check-circle text-blue-500 text-sm"></i>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        "{testimonial.value?.testimonial}"
                      </p>
                      <p className="text-xs text-gray-500">
                        {testimonial.value?.position} - {testimonial.value?.company} - {testimonial.value?.location}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cập nhật: {new Date(testimonial.updatedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(testimonial)}
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(testimonial.id)}
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

export default TestimonialsAdmin;
