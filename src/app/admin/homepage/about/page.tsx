'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { SystemSetting } from '@/types/api';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AboutSectionData {
  title: string;
  subtitle: string;
  content: string;
  image1: string;
  image2: string;
  stats: {
    label: string;
    value: string;
  }[];
}

const AboutSectionAdmin: FC = () => {
  const [aboutSections, setAboutSections] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<AboutSectionData>({
    title: '',
    subtitle: '',
    content: '',
    image1: '',
    image2: '',
    stats: [{ label: '', value: '' }]
  });
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    alert(`${title}: ${description}`);
  };

  useEffect(() => {
    fetchAboutSections();
  }, []);

  const fetchAboutSections = async () => {
    try {
      const response = await apiClient.getAboutSections();
      if (response.success) {
        setAboutSections(response.data || []);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu about sections',
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
        const response = await apiClient.updateAboutSection({
          id: isEditing,
          value: formData
        });
        
        if (response.success) {
          toast({
            title: 'Thành công',
            description: 'Đã cập nhật about section'
          });
          fetchAboutSections();
          setIsEditing(null);
          resetForm();
        }
      } else {
        const response = await apiClient.createAboutSection({
          key: `about_${Date.now()}`,
          value: formData,
          description: 'About section configuration'
        });
        
        if (response.success) {
          toast({
            title: 'Thành công',
            description: 'Đã tạo about section mới'
          });
          fetchAboutSections();
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

  const handleEdit = (section: SystemSetting) => {
    setIsEditing(section.id);
    const data = section.value as AboutSectionData;
    setFormData({
      ...data,
      stats: data.stats || [{ label: '', value: '' }]
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa about section này?')) return;
    
    try {
      const response = await apiClient.deleteAboutSection(id);
      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Đã xóa about section'
        });
        fetchAboutSections();
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa about section',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image1' | 'image2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));

    const apiFormData = new FormData();
    apiFormData.append('files', file);
    apiFormData.append('folder', 'about_page');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: apiFormData,
      });

      const result = await response.json();

      if (result.success && result.data.files.length > 0) {
        const imageUrl = result.data.files[0].secure_url;
        setFormData(prev => ({ ...prev, [field]: imageUrl }));
        toast({
          title: 'Thành công',
          description: 'Tải ảnh lên thành công.',
        });
      } else {
        throw new Error(result.error || 'Tải ảnh lên thất bại.');
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải ảnh lên.',
        variant: 'destructive',
      });
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };
  const addStat = () => {
    setFormData({
      ...formData,
      stats: [...formData.stats, { label: '', value: '' }]
    });
  };

  const removeStat = (index: number) => {
    setFormData({
      ...formData,
      stats: formData.stats.filter((_, i) => i !== index)
    });
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...formData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData({
      ...formData,
      stats: newStats
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      content: '',
      image1: '',
      image2: '',
      stats: [{ label: '', value: '' }]
    });
    setIsEditing(null);
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
    
    <Tabs defaultValue="manage" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manage">Quản lý</TabsTrigger>
        <TabsTrigger value="preview">Xem trước</TabsTrigger>
      </TabsList>

      <TabsContent value="manage" className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý About Section</h1>
            <p className="text-gray-600 mt-2">
              Quản lý nội dung phần giới thiệu công ty
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/homepage">
              <i className="fas fa-arrow-left mr-2"></i>
              Quay lại
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {isEditing ? 'Chỉnh sửa About Section' : 'Thêm About Section mới'}
              </CardTitle>
              <CardDescription>
                Cấu hình nội dung giới thiệu về công ty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Tiêu đề chính</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Về chúng tôi"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Tiêu đề phụ</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Nhà thuốc uy tín hàng đầu"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Nội dung chính</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Mô tả chi tiết về công ty..."
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image1">Ảnh 1</Label>
                    <Input
                      id="image1"
                      type="file"
                      onChange={(e) => handleImageUpload(e, 'image1')}
                      className="mb-2"
                      accept="image/*"
                      disabled={uploading.image1}
                    />
                    {uploading.image1 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        <span>Đang tải lên...</span>
                      </div>
                    )}
                    {formData.image1 && !uploading.image1 && (
                      <div className="mt-2">
                        <img src={formData.image1} alt="Xem trước ảnh 1" className="w-full h-32 object-cover rounded-md border" />
                        <Input
                          type="text"
                          value={formData.image1}
                          readOnly
                          className="mt-1 text-xs text-gray-500 bg-gray-100"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="image2">Ảnh 2</Label>
                    <Input
                      id="image2"
                      type="file"
                      onChange={(e) => handleImageUpload(e, 'image2')}
                      className="mb-2"
                      accept="image/*"
                      disabled={uploading.image2}
                    />
                    {uploading.image2 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        <span>Đang tải lên...</span>
                      </div>
                    )}
                    {formData.image2 && !uploading.image2 && (
                      <div className="mt-2">
                        <img src={formData.image2} alt="Xem trước ảnh 2" className="w-full h-32 object-cover rounded-md border" />
                        <Input
                          type="text"
                          value={formData.image2}
                          readOnly
                          className="mt-1 text-xs text-gray-500 bg-gray-100"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Thống kê</Label>
                    <Button type="button" size="sm" onClick={addStat}>
                      <i className="fas fa-plus mr-2"></i>
                      Thêm
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.stats.map((stat, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={stat.label}
                          onChange={(e) => updateStat(index, 'label', e.target.value)}
                          placeholder="Nhãn"
                        />
                        <Input
                          value={stat.value}
                          onChange={(e) => updateStat(index, 'value', e.target.value)}
                          placeholder="Giá trị"
                        />
                        {formData.stats.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeStat(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
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
        </div>

        {/* Existing About Sections */}
        <Card>
          <CardHeader>
            <CardTitle>About Sections hiện có</CardTitle>
            <CardDescription>
              Danh sách tất cả about sections đã tạo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aboutSections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-info-circle text-4xl mb-4"></i>
                <p>Chưa có about section nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aboutSections.map((section) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{section.value?.title || 'Không có tiêu đề'}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {section.value?.subtitle || 'Không có tiêu đề phụ'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {section.value?.stats?.length || 0} thống kê
                        </p>
                      
                        <p className="text-xs text-gray-500">
                          Cập nhật: {new Date(section.updatedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(section)}
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(section.id)}
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
      </TabsContent>

      <TabsContent value="preview">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-eye mr-2"></i>
              Xem trước About Section
            </CardTitle>
            <CardDescription>
              Xem trước About Section như hiển thị trên trang chủ
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {aboutSections.length > 0 ? (
              aboutSections.map((section) => (
                <AboutPreview key={section.id} aboutData={section.value as AboutSectionData} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có dữ liệu About Section</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

// Component preview sử dụng component thực tế
const AboutPreview: FC<{ aboutData: AboutSectionData }> = ({ aboutData }) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <h2 className="text-3xl font-bold mb-6">{aboutData.title}</h2>
            <p className="text-gray-600 mb-4">{aboutData.subtitle}</p>
            <p className="text-gray-600 mb-6">{aboutData.content}</p>
            <div className="flex space-x-4 mt-8">
              {aboutData.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <img
                src={aboutData.image1}
                alt="Ảnh 1"
                className="rounded-lg shadow-lg"
                style={{ width: '300px', height: '200px', objectFit: 'cover' }}
              />
              <img
                src={aboutData.image2}
                alt="Ảnh 2"
                className="rounded-lg shadow-lg mt-8"
                style={{ width: '300px', height: '200px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionAdmin;
