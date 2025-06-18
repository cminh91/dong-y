"use client";

import React, { FC } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  value: string;
  onEditorChange: (content: string) => void;
  height?: number;
  placeholder?: string;
}

const TinyMCEEditor: FC<TinyMCEEditorProps> = ({
  value,
  onEditorChange,
  height = 400,
  placeholder = "Nhập nội dung chi tiết..."
}) => {
  // Use API key if available, otherwise use no-api-key for development
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key';

  return (
    <Editor
      apiKey={apiKey}
      value={value || ''}
      onEditorChange={onEditorChange}
      init={{
        height: height,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        placeholder: placeholder,
        branding: false,
        promotion: false,
        setup: (editor: any) => {
          editor.on('init', () => {
            editor.getContainer().style.transition = "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out";
          });

          editor.on('focus', () => {
            editor.getContainer().style.borderColor = "#10b981";
            editor.getContainer().style.boxShadow = "0 0 0 2px rgba(16, 185, 129, 0.2)";
          });

          editor.on('blur', () => {
            editor.getContainer().style.borderColor = "#d1d5db";
            editor.getContainer().style.boxShadow = "none";
          });
        },
        // Image upload settings
        images_upload_handler: (blobInfo: any) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(blobInfo.blob());
          });
        },
        paste_data_images: true,
        paste_as_text: false,
        link_default_target: '_blank',
        link_assume_external_targets: true
      }}
    />
  );
};

export default TinyMCEEditor;