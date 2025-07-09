'use client';

import { FC, useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, Plus, Eye, Upload, X, Loader } from 'lucide-react';
import Image from 'next/image';
import HeroSection from '@/components/home/HeroSection';

interface HeroSectionData {
  id: string;
  name: string;
  image: string;
  description: string;
}

interface HeroSection {
  id: string;
  key: string;
  category: string;
  value: HeroSectionData[];
}

// Component preview sử dụng component thực tế
const HeroPreview: FC<{ heroData: HeroSectionData[] }> = ({ heroData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === heroData.length - 1 ? 0 : prevIndex + 1
        );
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroData.length]);

  if (!heroData || heroData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chưa có dữ liệu Hero Section</p>
      </div>
    );
  }

  const item = heroData[currentIndex];

  return (
    <section className="relative py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className={`md:w-1/2 mb-10 md:mb-0 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {item.name}
          </h1>
          <p className="text-red-600 text-lg font-bold mb-8">
            {item.description}
          </p>
          <p className="text-blue-600 text-lg mb-8">
            <strong>LƯU Ý:</strong> Sản phẩm được sản xuất từ các loại dược liệu thiên 
            nhiên đạt chuẩn.
          </p>
          <div className="flex space-x-4 mb-6">
            <a href="/san-pham" className="btn-primary">Khám phá sản phẩm</a>
            <a href="/lien-he" className="btn-secondary">Tư vấn miễn phí</a>
          </div>
        </div>
        <div className={`md:w-1/2 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative">
            {item.image && item.image.trim() !== '' ? (
              <Image
                src={item.image}
                alt={item.name}
                className="rounded-lg shadow-xl w-full"
                width={600}
                height={400}
                style={{ height: "auto" }}
              />
            ) : (
              <div
                className="rounded-lg shadow-xl w-full bg-gray-200 flex items-center justify-center"
                style={{ height: "400px" }}
              >
                <span className="text-gray-500">Chưa có ảnh</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Component upload ảnh
const ImageUpload: FC<{
  currentImage?: string;
  onImageChange: (url: string) => void;
  label?: string;
}> = ({ currentImage, onImageChange, label = "Ảnh" }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentImage || '');
  }, [currentImage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh (jpg, png, gif, etc.)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File ảnh không được lớn hơn 10MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('folder', 'hero-sections');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data?.files?.length > 0) {
        const uploadedUrl = result.data.files[0].url;
        setPreviewUrl(uploadedUrl);
        onImageChange(uploadedUrl);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Có lỗi xảy ra khi upload ảnh. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {previewUrl && (
        <div className="relative inline-block">
          <Image
            src={previewUrl}
            alt="Preview"
            width={200}
            height={150}
            className="rounded-lg object-cover border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? 'Đang upload...' : 'Chọn ảnh'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

const HeroSectionAdmin: FC = () => {
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroSectionData | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: ''
  });
  const fetchHeroSection = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hero-sections');
      if (response.ok) {
        const result = await response.json();
        console.log("API Response:", JSON.stringify(result, null, 2));

        if (result.success && result.data && result.data.length > 0) {
          const heroMainSetting = result.data.find((item: any) => item.key === 'hero_main');
          console.log("Found hero_main setting:", JSON.stringify(heroMainSetting, null, 2));

          if (heroMainSetting) {
            let heroData;
            try {
              console.log("Value to be parsed:", heroMainSetting.value);
              console.log("Type of value:", typeof heroMainSetting.value);

              heroData = typeof heroMainSetting.value === 'string' 
                ? JSON.parse(heroMainSetting.value) 
                : heroMainSetting.value;
              
              console.log("Parsed heroData:", JSON.stringify(heroData, null, 2));

            } catch (e) {
              console.error('Error parsing hero data:', e);
              heroData = [];
            }
            
            const finalHeroSection = {
              ...heroMainSetting,
              value: Array.isArray(heroData) ? heroData : []
            };
            console.log("Final state to be set:", JSON.stringify(finalHeroSection, null, 2));
            setHeroSection(finalHeroSection);
          } else {
            console.log("No 'hero_main' setting found. Initializing empty state.");
            setHeroSection({
              id: '',
              key: 'hero_main',
              category: 'homepage',
              value: []
            });
          }
        } else {
          console.log("API request was successful, but no data was returned. Initializing empty state.");
          setHeroSection({
            id: '',
            key: 'hero_main',
            category: 'homepage',
            value: []
          });
        }
      } else {
        console.error('Failed to fetch hero section, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching hero section:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.image.trim() || !formData.description.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSaving(true);
    
    try {
      const currentData = heroSection?.value || [];
      let newData;

      if (editingItem) {
        // Update existing item
        newData = currentData.map(item => 
          item.id === editingItem.id 
            ? { ...item, ...formData }
            : item
        );
      } else {
        // Add new item
        const newItem: HeroSectionData = {
          id: Date.now().toString(),
          ...formData
        };
        newData = [...currentData, newItem];
      }

      const response = await fetch('/api/hero-sections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'hero_main',
          category: 'homepage',
          value: newData
        }),
      });

      if (response.ok) {
        await fetchHeroSection();
        resetForm();
        alert(editingItem ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving hero section:', error);
      alert('Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: HeroSectionData) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      image: item.image,
      description: item.description
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa item này?')) return;

    setSaving(true);
    
    try {
      const currentData = heroSection?.value || [];
      const newData = currentData.filter(item => item.id !== itemId);

      const response = await fetch('/api/hero-sections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'hero_main',
          category: 'homepage',
          value: newData
        }),
      });

      if (response.ok) {
        await fetchHeroSection();
        alert('Xóa thành công!');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting hero item:', error);
      alert('Có lỗi xảy ra khi xóa dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      description: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý Banner Section</h1>
        <p className="text-gray-600">Chỉnh sửa nội dung Banner Section hiển thị trên trang chủ</p>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Quản lý</TabsTrigger>
          <TabsTrigger value="preview">Xem trước</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Danh sách Banner</CardTitle>
                  <CardDescription>
                    Quản lý các Banner 
                  </CardDescription>
                </div>
                <Button onClick={() => setShowForm(!showForm)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm mới
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>
                      {editingItem ? 'Chỉnh sửa Banner Item' : 'Thêm Banner Item mới'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Tiêu đề</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Nhập tiêu đề banner section"
                          required
                        />
                      </div>

                      <ImageUpload
                        currentImage={formData.image}
                        onImageChange={(url) => setFormData({...formData, image: url})}
                        label="Ảnh Banner Section"
                      />

                      <div>
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Nhập mô tả banner section"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                              Đang lưu...
                            </>
                          ) : (
                            editingItem ? 'Cập nhật' : 'Thêm mới'
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {heroSection?.value && heroSection.value.length > 0 ? (
                  heroSection.value.map((item, index) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            {item.image && item.image.trim() !== '' ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={120}
                                height={80}
                                className="rounded-md object-cover"
                              />
                            ) : (
                              <div
                                className="rounded-md bg-gray-200 flex items-center justify-center"
                                style={{ width: "120px", height: "80px" }}
                              >
                                <span className="text-gray-500 text-xs">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                            <p className="text-gray-600 mb-2">{item.description}</p>
                            <div className="text-sm text-gray-500">
                              Thứ tự hiển thị: {index + 1}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Chưa có banner item nào</p>
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm banner item đầu tiên
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Xem trước Banner Section
              </CardTitle>
              <CardDescription>
                Xem trước Banner Section như hiển thị trên trang chủ
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <HeroPreview heroData={heroSection?.value || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HeroSectionAdmin;
