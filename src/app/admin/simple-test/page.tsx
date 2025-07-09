"use client";

import { useState } from 'react';
import TinyMCEEditor from '@/components/admin/TinyMCEEditor';

export default function SimpleTestPage() {
  const [content, setContent] = useState('<p>Test content - không có ảnh</p>');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Simple TinyMCE Test
          </h1>
          
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              <strong>Test:</strong> Trang này sẽ load TinyMCE với nội dung đơn giản. 
              Kiểm tra console/network tab để đảm bảo không có API calls tự động.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <TinyMCEEditor
              value={content}
              onEditorChange={setContent}
              height={300}
              folder="simple-test"
              showSEOTips={false}
            />
          </div>
          
          <div className="text-sm text-gray-600">
            <strong>Content length:</strong> {content.replace(/<[^>]*>/g, '').length} characters
          </div>
        </div>
      </div>
    </div>
  );
}
