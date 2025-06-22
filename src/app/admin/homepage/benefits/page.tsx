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
import { IconPicker } from '@/components/ui/icon-picker';

interface BenefitData {
  icon: string;
  title: string;
  description: string;
}

const BenefitsAdminPage: FC = () => {
  const [benefits, setBenefits] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<BenefitData>({
    icon: '',
    title: '',
    description: '',
  });

  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    alert(`${title}: ${description}`);
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getBenefitsSections();
      if (response.success) {
        setBenefits(response.data || []);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu lợi ích',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        const response = await apiClient.updateBenefitsSection({
          id: isEditing,
          value: formData,
        });
        
        if (response.success) {
          toast({
            title: 'Thành công',
            description: 'Đã cập nhật lợi ích',
          });
          fetchBenefits();
          resetForm();
        }
      } else {
        const response = await apiClient.createBenefitsSection({
          key: `benefit_${Date.now()}`,
          value: formData,
          description: 'Benefit item',
        });
        
        if (response.success) {
          toast({
            title: 'Thành công',
            description: 'Đã tạo lợi ích mới',
          });
          fetchBenefits();
          resetForm();
        }
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi lưu dữ liệu',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (benefit: SystemSetting) => {
    setIsEditing(benefit.id);
    setFormData(benefit.value as BenefitData);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lợi ích này?')) return;
    
    try {
      const response = await apiClient.deleteBenefitsSection(id);
      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Đã xóa lợi ích',
        });
        fetchBenefits();
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa lợi ích',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({
      icon: '',
      title: '',
      description: '',
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Lợi ích</h1>
          <p className="text-gray-600 mt-2">
            Thêm, sửa, xóa và xem trước các lợi ích hiển thị trên trang chủ.
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? 'Chỉnh sửa Lợi ích' : 'Thêm Lợi ích mới'}
                </CardTitle>
                <CardDescription>
                  Điền thông tin chi tiết cho lợi ích.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="icon">Biểu tượng</Label>
                    <IconPicker
                      value={formData.icon}
                      onChange={(value) => setFormData({ ...formData, icon: value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Tiêu đề</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Tiêu đề lợi ích"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Mô tả chi tiết"
                      required
                      rows={4}
                    />
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

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách Lợi ích</CardTitle>
                <CardDescription>
                  Các lợi ích hiện đang có trên hệ thống.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {benefits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-info-circle text-4xl mb-4"></i>
                    <p>Chưa có lợi ích nào được tạo.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {benefits.map((benefit) => (
                      <div key={benefit.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <i className={`fas ${benefit.value.icon} text-2xl text-green-600 w-8 text-center`}></i>
                          <div>
                            <h3 className="font-medium">{benefit.value.title}</h3>
                            <p className="text-sm text-gray-600">{benefit.value.description}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(benefit)}
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(benefit.id)}
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="preview">
        <Card>
            <CardHeader>
                <CardTitle>Xem trước</CardTitle>
                <CardDescription>Đây là cách phần lợi ích sẽ hiển thị trên trang chủ.</CardDescription>
            </CardHeader>
            <CardContent>
                <BenefitsPreview benefitsData={benefits} />
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

const BenefitItemPreview: FC<BenefitData> = ({ icon, title, description }) => {
    return (
      <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-300">
        <i className={`fas ${icon} text-3xl text-green-600 w-10 text-center`}></i>
        <div>
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    );
  };
  
const BenefitsPreview: FC<{ benefitsData: SystemSetting[] }> = ({ benefitsData }) => {
    if (benefitsData.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500">
          <i className="fas fa-info-circle text-4xl mb-4"></i>
          <p>Chưa có lợi ích nào để xem trước.</p>
          <p className="text-sm">Hãy thêm một vài lợi ích trong tab "Quản lý".</p>
        </div>
      );
    }
  
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Lợi Ích Của Y Học Cổ Truyền</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Đông y không chỉ điều trị triệu chứng mà còn cân bằng cơ thể, tăng cường sức đề kháng và phòng ngừa bệnh tật.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefitsData.map((benefit) => (
              <BenefitItemPreview key={benefit.id} {...(benefit.value as BenefitData)} />
            ))}
          </div>
        </div>
      </section>
    );
};

export default BenefitsAdminPage;