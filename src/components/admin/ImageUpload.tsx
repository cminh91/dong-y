"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, X, MoveLeft, MoveRight, Star } from 'lucide-react';

interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  type: string;
  original_filename: string;
}

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 5, folder = 'products' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('ImageUpload - Received images prop:', images, 'Type:', typeof images, 'Is Array:', Array.isArray(images));

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
toast.error(`Chỉ có thể upload tối đa ${maxImages} ảnh`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      // All files will be saved to /uploads/upload/ folder

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      console.log('Upload response:', data); // Debug log

      if (data.success) {
        // Extract url from local upload response
        const uploadedFiles: UploadedFile[] = data.data.files;
        const newImageUrls = uploadedFiles.map(file => file.url);
        const newImages = [...images, ...newImageUrls];
        onImagesChange(newImages);
toast.success(`Upload thành công ${uploadedFiles.length} ảnh vào thư mục uploads/upload!`);
      } else {
toast.error(data.error || 'Có lỗi xảy ra khi upload ảnh');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
toast.error('Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragOver
                ? 'border-green-500 bg-green-50 scale-105'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="text-gray-400">
                <Upload className="mx-auto h-12 w-12" />
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || images.length >= maxImages}
                  className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                >
                  {uploading ? 'Đang upload...' : 'Chọn ảnh để upload'}
                </Button>
                <p className="text-gray-500 text-sm mt-2">
                  hoặc kéo thả ảnh vào đây
                </p>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>PNG, JPG, GIF, WebP tối đa 10MB mỗi ảnh. Tối đa {maxImages} ảnh.</p>
                <p className="text-gray-500 font-medium">
                  Đã upload: {images.length}/{maxImages} ảnh
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Image Preview Grid */}
      {images.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ảnh đã upload ({images.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative group border rounded-lg overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square relative">
                    {image && image.trim() !== '' ? (
                      <Image
                        src={image}
                        alt={`Upload ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          console.error('Image load error for:', image);
                          (e.target as HTMLImageElement).src = '/images/placeholder.png';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', image);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Không có ảnh</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Controls */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    {/* Move Left */}
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveImage(index, index - 1)}
                        className="p-2 bg-white/90 hover:bg-white text-gray-700"
                        title="Di chuyển trái"
                      >
                        <MoveLeft className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* Remove */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white"
                      title="Xóa ảnh"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    
                    {/* Move Right */}
                    {index < images.length - 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveImage(index, index + 1)}
                        className="p-2 bg-white/90 hover:bg-white text-gray-700"
                        title="Di chuyển phải"
                      >
                        <MoveRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Primary Image Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Ảnh chính</span>
                    </div>
                  )}
                  
                  {/* Image Index */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Ảnh đầu tiên sẽ là ảnh chính của sản phẩm. Sử dụng các nút di chuyển để sắp xếp lại thứ tự.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
