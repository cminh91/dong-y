"use client";

import { useState } from 'react';
import TinyMCEEditor from '@/components/admin/TinyMCEEditor';

export default function TestEditorPage() {
  const [content, setContent] = useState(`
    <h1>Test TinyMCE Editor</h1>
    <p>Đây là nội dung mẫu để test editor.</p>
    
    <h2>Các tính năng đã được sửa:</h2>
    <ul>
      <li>✅ Không tự động gọi API upload khi load trang</li>
      <li>✅ Upload ảnh chỉ khi click Insert → Image</li>
      <li>✅ SEO tips hiển thị</li>
      <li>✅ Templates có sẵn</li>
      <li>✅ Text patterns (markdown shortcuts)</li>
      <li>✅ Word count</li>
      <li>✅ Custom styles</li>
      <li>✅ Enhanced paste từ Word (không auto-upload)</li>
    </ul>

    <h2>Hướng dẫn sử dụng:</h2>
    <ol>
      <li><strong>Upload ảnh:</strong> Insert → Image → Browse (sẽ gọi API)</li>
      <li><strong>Paste ảnh:</strong> Paste sẽ hiển thị base64 tạm thời</li>
      <li><strong>Templates:</strong> Insert → Template để chọn template</li>
      <li><strong>Markdown:</strong> **bold**, *italic*, # heading</li>
    </ol>

    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
      <p className="text-sm text-yellow-800">
        <strong>Lưu ý:</strong> Editor sẽ không tự động gọi API khi load.
        Chỉ gọi API khi bạn chủ động upload ảnh qua Insert → Image.
      </p>
    </div>
  `);

  const handleSave = () => {
    console.log('Content to save:', content);
    alert('Content saved to console!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test TinyMCE Editor
          </h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung bài viết
            </label>
            <TinyMCEEditor
              value={content}
              onEditorChange={setContent}
              height={500}
              folder="test"
              showSEOTips={true}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Độ dài: {content.replace(/<[^>]*>/g, '').length} ký tự
            </div>
            
            <div className="space-x-4">
              <button
                type="button"
                onClick={() => setContent('')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
          
          {/* Preview */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview:</h2>
            <div 
              className="prose max-w-none border rounded-lg p-4 bg-gray-50"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
