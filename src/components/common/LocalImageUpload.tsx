'use client';

import React, { useState } from 'react';
import { uploadFiles, validateFile, type UploadResult } from '@/lib/upload-local';
import Image from 'next/image';

interface LocalImageUploadProps {
  onUploadComplete?: (results: UploadResult[]) => void;
  maxFiles?: number;
  className?: string;
}

export default function LocalImageUpload({
  onUploadComplete,
  maxFiles = 5,
  className = ''
}: LocalImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validationErrors: string[] = [];
    files.forEach((file, index) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        validationErrors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    // Check max files limit
    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (since we don't have real progress from fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const results = await uploadFiles(files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadedFiles(results);
      onUploadComplete?.(results);
      
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
            uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Choose Images'}
        </label>
        <p className="mt-2 text-sm text-gray-500">
          Select up to {maxFiles} images (JPEG, PNG, GIF, WebP, max 10MB each)
        </p>        <p className="text-xs text-gray-400">
          Files will be saved to /api/uploads/upload/
        </p>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="border rounded-lg p-2 relative group">
                <div className="relative aspect-square">
                  <Image
                    src={file.url}
                    alt={file.original_filename}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {file.original_filename}
                </p>
                <p className="text-xs text-gray-400">
                  {Math.round(file.size / 1024)} KB
                </p>
                <p className="text-xs text-blue-600 break-all">
                  {file.url}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
