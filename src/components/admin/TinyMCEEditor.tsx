"use client";

import React, { FC, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import toast from 'react-hot-toast';

interface TinyMCEEditorProps {
  value: string;
  onEditorChange: (content: string) => void;
  height?: number;
  placeholder?: string;
  folder?: string; // Folder for image uploads
  showSEOTips?: boolean; // Show SEO tips
}

const TinyMCEEditor: FC<TinyMCEEditorProps> = ({
  value,
  onEditorChange,
  height = 600,
  placeholder = "Nhập nội dung chi tiết...",
  folder = "posts",
  showSEOTips = true
}) => {
  // Use API key if available, otherwise use no-api-key for development
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key';
  const [showTips, setShowTips] = useState(showSEOTips);

  // Upload image function for file picker
  const uploadImageFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success && data.data?.files?.length > 0) {
      return data.data.files[0].url;
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  };

  return (
    <div className="w-full">
      {/* SEO Tips */}
      {showSEOTips && showTips && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips viết bài chuẩn SEO:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Sử dụng H1 cho tiêu đề chính (chỉ 1 lần)</li>
                <li>• Sử dụng H2, H3 để phân chia nội dung rõ ràng</li>
                <li>• Thêm alt text cho tất cả hình ảnh</li>
                <li>• Upload ảnh bằng Insert → Image (không paste trực tiếp)</li>
                <li>• Sử dụng danh sách để tổ chức thông tin</li>
                <li>• Nội dung nên từ 300-2000 từ</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setShowTips(false)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <Editor
        apiKey={apiKey}
        value={value || ''}
        onEditorChange={onEditorChange}
        init={{
          height: height,
          menubar: 'file edit view insert format tools table help',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
            'codesample', 'hr', 'pagebreak', 'nonbreaking', 'template', 'textpattern'
          ],
          toolbar1: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
            'forecolor backcolor | alignleft aligncenter alignright alignjustify',
          toolbar2: 'bullist numlist | outdent indent | link unlink anchor | image media table | ' +
            'hr pagebreak | searchreplace | visualblocks code fullscreen',
          toolbar3: 'insertdatetime | charmap emoticons | codesample | template | preview help',
          content_style: `
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              font-size: 14px; 
              line-height: 1.6;
              color: #374151;
            }
            img { 
              max-width: 100%; 
              height: auto; 
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            p { margin: 0 0 1rem 0; }
          `,
          placeholder: placeholder,
          branding: false,
          promotion: false,
          skin: 'oxide',
          content_css: 'default',
          setup: (editor: any) => {
            editor.on('init', () => {
              const container = editor.getContainer();
              container.style.transition = "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out";
              container.style.borderRadius = "0.5rem";
              container.style.border = "1px solid #d1d5db";
            });

            editor.on('focus', () => {
              const container = editor.getContainer();
              container.style.borderColor = "#10b981";
              container.style.boxShadow = "0 0 0 2px rgba(16, 185, 129, 0.2)";
            });

            editor.on('blur', () => {
              const container = editor.getContainer();
              container.style.borderColor = "#d1d5db";
              container.style.boxShadow = "none";
            });

            // Handle image paste success
            editor.on('PastePostProcess', (e: any) => {
              const images = e.node.querySelectorAll('img');
              if (images.length > 0) {
                toast.success(`Đã paste ${images.length} ảnh thành công`);
              }
            });
          },
          // Enhanced image paste settings - allow paste but don't auto-upload
          paste_data_images: true,
          paste_as_text: false,
          paste_word_valid_elements: '*[*]',
          paste_webkit_styles: 'all',
          paste_retain_style_properties: 'all',
          paste_merge_formats: true,
          paste_auto_cleanup_on_paste: true,
          paste_remove_styles_if_webkit: false,
          paste_strip_class_attributes: 'none',
          paste_enable_default_filters: false,
          paste_preprocess: (_plugin: any, args: any) => {
            // Process content before paste
            const content = args.content;
            // Clean up Word-specific styling while preserving images
            args.content = content.replace(/mso-[^;]+;?/gi, '');
          },
          paste_postprocess: (_plugin: any, args: any) => {
            // Process after paste
            const content = args.node;
            const images = content.querySelectorAll('img');
            
            images.forEach((img: HTMLImageElement) => {
              // Handle all image types
              if (img.src) {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.borderRadius = '8px';
                img.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                
                // Add responsive class if needed
                img.className = (img.className || '') + ' responsive-image';
              }
            });
          },
          link_default_target: '_blank',
          link_assume_external_targets: true,
          // Enhanced image handling
          image_advtab: true,
          image_caption: true,
          image_description: true,
          image_dimensions: true,
          image_title: true,
          image_class_list: [
            { title: 'Responsive', value: 'img-responsive' },
            { title: 'Rounded', value: 'img-rounded' },
            { title: 'Circle', value: 'img-circle' },
            { title: 'Thumbnail', value: 'img-thumbnail' }
          ],

          // File picker và upload
          file_picker_types: 'image',
          file_picker_callback: (callback: any, _value: any, meta: any) => {
            if (meta.filetype === 'image') {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');

              input.onchange = async (event: Event) => {
                const target = event.target as HTMLInputElement;
                const file = target.files?.[0];
                if (file) {
                  try {
                    const uploadedUrl = await uploadImageFile(file);
                    callback(uploadedUrl, {
                      alt: file.name.replace(/\.[^/.]+$/, ""),
                      title: file.name.replace(/\.[^/.]+$/, "")
                    });
                    toast.success('Tải ảnh lên thành công!');
                  } catch (error) {
                    console.error('File picker upload error:', error);
                    toast.error('Lỗi khi tải ảnh lên');
                  }
                }
              };

              input.click();
            }
          },

          // Disable automatic uploads to prevent unwanted API calls
          automatic_uploads: false,
          images_upload_handler: undefined,
          // Additional configurations
          resize: true,
          statusbar: true,
          elementpath: false,
          contextmenu: 'link image table',
          paste_block_drop: false,
          browser_spellcheck: true,
          convert_urls: false,
          relative_urls: false,

          // Templates for common content
          templates: [
            {
              title: 'Bài viết cơ bản',
              description: 'Template cho bài viết thông thường',
              content: `
                <h1>Tiêu đề chính</h1>
                <p>Mở đầu bài viết...</p>

                <h2>Phần 1</h2>
                <p>Nội dung phần 1...</p>

                <h2>Phần 2</h2>
                <p>Nội dung phần 2...</p>

                <h2>Kết luận</h2>
                <p>Tóm tắt và kết luận...</p>
              `
            },
            {
              title: 'Bài review sản phẩm',
              description: 'Template cho bài review',
              content: `
                <h1>Review [Tên sản phẩm]</h1>

                <h2>Thông tin sản phẩm</h2>
                <ul>
                  <li><strong>Tên:</strong> </li>
                  <li><strong>Giá:</strong> </li>
                  <li><strong>Thương hiệu:</strong> </li>
                </ul>

                <h2>Ưu điểm</h2>
                <ul>
                  <li></li>
                </ul>

                <h2>Nhược điểm</h2>
                <ul>
                  <li></li>
                </ul>

                <h2>Đánh giá tổng thể</h2>
                <p>Rating: ⭐⭐⭐⭐⭐</p>
                <p>Kết luận...</p>
              `
            }
          ],

          // Text patterns for quick formatting
          textpattern_patterns: [
            {start: '*', end: '*', format: 'italic'},
            {start: '**', end: '**', format: 'bold'},
            {start: '#', format: 'h1'},
            {start: '##', format: 'h2'},
            {start: '###', format: 'h3'},
            {start: '1. ', cmd: 'InsertOrderedList'},
            {start: '* ', cmd: 'InsertUnorderedList'},
            {start: '- ', cmd: 'InsertUnorderedList'}
          ],

          // Word count
          wordcount: {
            showWords: true,
            showCharacters: true,
            showCharactersWithoutSpaces: false,
            countSpacesAsSeparateWords: false
          },

          // Custom styles
          style_formats: [
            {
              title: 'Headings', items: [
                {title: 'Heading 1', format: 'h1'},
                {title: 'Heading 2', format: 'h2'},
                {title: 'Heading 3', format: 'h3'},
                {title: 'Heading 4', format: 'h4'},
                {title: 'Heading 5', format: 'h5'},
                {title: 'Heading 6', format: 'h6'}
              ]
            },
            {
              title: 'Inline', items: [
                {title: 'Bold', format: 'bold'},
                {title: 'Italic', format: 'italic'},
                {title: 'Underline', format: 'underline'},
                {title: 'Strikethrough', format: 'strikethrough'},
                {title: 'Superscript', format: 'superscript'},
                {title: 'Subscript', format: 'subscript'},
                {title: 'Code', format: 'code'}
              ]
            },
            {
              title: 'Blocks', items: [
                {title: 'Paragraph', format: 'p'},
                {title: 'Blockquote', format: 'blockquote'},
                {title: 'Div', format: 'div'},
                {title: 'Pre', format: 'pre'}
              ]
            },
            {
              title: 'Alignment', items: [
                {title: 'Left', format: 'alignleft'},
                {title: 'Center', format: 'aligncenter'},
                {title: 'Right', format: 'alignright'},
                {title: 'Justify', format: 'alignjustify'}
              ]
            }
          ]
        }}
      />
    </div>
  );
};

export default TinyMCEEditor;