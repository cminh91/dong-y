"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';

interface UploadedFile {
  url: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
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

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      alert(`Chỉ có thể upload tối đa ${maxImages} ảnh`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      // Add folder parameter for Cloudinary organization
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Extract secure_url from Cloudinary response
        const uploadedFiles: UploadedFile[] = data.data.files;
        const newImageUrls = uploadedFiles.map(file => file.secure_url);
        const newImages = [...images, ...newImageUrls];
        onImagesChange(newImages);
        alert(`Upload thành công ${uploadedFiles.length} ảnh lên Cloudinary!`);
      } else {
        alert(data.error || 'Có lỗi xảy ra khi upload ảnh');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Có lỗi xảy ra khi upload ảnh');
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
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
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
        
        <div className="space-y-2">
          <div className="text-gray-400">
            <i className="fas fa-cloud-upload-alt text-3xl"></i>
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-green-600 hover:text-green-700 font-medium"
              disabled={uploading || images.length >= maxImages}
            >
              {uploading ? 'Đang upload...' : 'Chọn ảnh để upload'}
            </button>
            <p className="text-gray-500 text-sm mt-1">
              hoặc kéo thả ảnh vào đây
            </p>
          </div>
          <p className="text-xs text-gray-400">
            PNG, JPG, GIF, WebP tối đa 10MB mỗi ảnh. Tối đa {maxImages} ảnh.
          </p>
          <p className="text-xs text-green-600">
            ✓ Upload lên Cloudinary CDN
          </p>
          <p className="text-xs text-gray-500">
            Đã upload: {images.length}/{maxImages} ảnh
          </p>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Ảnh đã upload ({images.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group border rounded-lg overflow-hidden bg-gray-100"
              >
                <div className="aspect-square relative">
                  <Image
                    src={image}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.png';
                    }}
                  />
                </div>
                
                {/* Image Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  {/* Move Left */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className="p-1 bg-white rounded text-gray-700 hover:bg-gray-100"
                      title="Di chuyển trái"
                    >
                      <i className="fas fa-arrow-left text-xs"></i>
                    </button>
                  )}
                  
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-1 bg-red-500 rounded text-white hover:bg-red-600"
                    title="Xóa ảnh"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                  
                  {/* Move Right */}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className="p-1 bg-white rounded text-gray-700 hover:bg-gray-100"
                      title="Di chuyển phải"
                    >
                      <i className="fas fa-arrow-right text-xs"></i>
                    </button>
                  )}
                </div>
                
                {/* Primary Image Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Ảnh chính
                  </div>
                )}
                
                {/* Image Index */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            <i className="fas fa-info-circle mr-1"></i>
            Ảnh đầu tiên sẽ là ảnh chính của sản phẩm. Kéo thả để sắp xếp lại thứ tự.
          </p>
        </div>
      )}
    </div>
  );
}
