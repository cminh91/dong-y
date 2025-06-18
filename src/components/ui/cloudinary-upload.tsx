'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

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

interface CloudinaryUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  className?: string;
}

export default function CloudinaryUpload({
  onUploadComplete,
  onUploadError,
  folder = 'general',
  multiple = true,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSizeInMB = 10,
  className = ''
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `File size must be less than ${maxSizeInMB}MB`;
    }

    return null;
  };

  const uploadFiles = async (files: FileList) => {
    if (files.length === 0) return;

    // Check max files limit
    if (uploadedFiles.length + files.length > maxFiles) {
      const error = `Maximum ${maxFiles} files allowed`;
      toast.error(error);
      onUploadError?.(error);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      const validFiles: File[] = [];

      // Validate all files first
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const error = validateFile(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      // Add files to FormData
      validFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const newFiles = result.data.files;
        setUploadedFiles(prev => [...prev, ...newFiles]);
        toast.success(result.data.message);
        onUploadComplete?.(newFiles);
      } else {
        const error = result.error || 'Upload failed';
        toast.error(error);
        onUploadError?.(error);
      }
    } catch (error) {
      const errorMessage = 'Upload failed. Please try again.';
      console.error('Upload error:', error);
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      uploadFiles(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files) {
      uploadFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeFile = async (publicId: string) => {
    try {
      const response = await fetch(`/api/upload?public_id=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFiles(prev => prev.filter(file => file.public_id !== publicId));
        toast.success('File removed successfully');
      } else {
        toast.error(result.error || 'Failed to remove file');
      }
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Failed to remove file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            {uploading ? (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
            </p>
            <p className="text-sm text-gray-500">
              {acceptedTypes.join(', ')} up to {maxSizeInMB}MB each
            </p>
            {maxFiles > 1 && (
              <p className="text-sm text-gray-500">
                Maximum {maxFiles} files ({uploadedFiles.length}/{maxFiles} uploaded)
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || uploadedFiles.length >= maxFiles}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>

          <Input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <div key={file.public_id} className="relative group border rounded-lg p-2">
                <div className="aspect-square relative overflow-hidden rounded">
                  <img
                    src={file.secure_url}
                    alt={file.original_filename}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(file.public_id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <p className="truncate">{file.original_filename}</p>
                  <p>{file.width}×{file.height} • {formatFileSize(file.bytes)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
