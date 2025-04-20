import React, { FC } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  value: string | null;
  onEditorChange: (content: string) => void;
}

const TinyMCEEditor: FC<TinyMCEEditorProps> = ({ value, onEditorChange }) => {
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY; // Lấy API key từ biến môi trường

  if (!apiKey) {
    console.error("TinyMCE API key is not set.");
    // Render a fallback or error message
    return <div>Lỗi: Không tìm thấy TinyMCE API key.</div>;
  }

  return (
    <Editor
      apiKey={apiKey}
      init={{
        height: 500, // Tăng chiều cao
        menubar: true, // Hiển thị menubar
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount',
          'seo', // Ví dụ plugin liên quan đến SEO (cần kiểm tra plugin có tồn tại không)
          'codesample', // Thêm plugin code sample
          'linkchecker', // Thêm link checker
          'visualchars', // Thêm visual characters
        ],
        toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help | image media table | fullscreen code | restoredraft', // Toolbar mở rộng
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        // Thêm các tùy chọn cấu hình khác cho SEO nếu cần
        // Ví dụ: image_advtab: true, link_list: "/my-dynamic-list", ...
      }}
      value={value || ''}
      onEditorChange={onEditorChange}
    />
  );
};

export default TinyMCEEditor;