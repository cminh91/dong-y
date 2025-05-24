'use client';
import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import TinyMCEEditor from '@/components/admin/TinyMCEEditor'; // Import TinyMCE Editor tùy chỉnh

type Category = {
  id: string;
  name: string;
};

const EditProductPage: FC = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  // Dữ liệu mẫu thay thế cho dữ liệu từ Prisma
  const categories: Category[] = [
    { id: '1', name: 'Thuốc bổ' },
    { id: '2', name: 'Thuốc bổ gan' },
    { id: '3', name: 'Dược liệu' },
    { id: '4', name: 'Gia vị Đông y' },
    { id: '5', name: 'Trà thảo dược' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    salePrice: '',
    stock: '',
    shortDescription: '',
    description: '',
    imageUrls: [] as string[],
    metaKeywords: '',
    metaTitle: '',
    metaDescription: '',
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Giả lập tải dữ liệu sản phẩm
  useEffect(() => {
    // Giả lập dữ liệu sản phẩm dựa trên ID
    const mockProduct = {
      id: productId,
      name: 'HEPASAKY GOLD',
      categoryId: '2',
      price: '320000',
      salePrice: '',
      stock: '25',
      shortDescription: 'Giải độc gan, hỗ trợ điều trị viêm gan, vàng da',
      description: '<p>Sản phẩm được bào chế từ các thảo dược quý giúp thanh lọc cơ thể, tăng cường chức năng gan, hỗ trợ điều trị các bệnh về gan hiệu quả.</p>',
      imageUrls: ['/images/hepasaky.png'],
      metaKeywords: 'thuốc bổ gan, giải độc gan, viêm gan',
      metaTitle: '',
      metaDescription: '',
    };

    setFormData(mockProduct);
    setImagePreviews(mockProduct.imageUrls);
  }, [productId]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      // const newImagePreviews: string[] = [];
      // TODO: Implement actual image upload and get URLs
      const uploadedImageUrls: string[] = filesArray.map(file => URL.createObjectURL(file)); // Using temporary URLs for preview

      setImagePreviews(uploadedImageUrls);
      // For now, just store temporary URLs or handle upload separately
      // setFormData((prev) => ({ ...prev, imageUrls: uploadedImageUrls }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Giả lập cập nhật sản phẩm thành công
      setTimeout(() => {
        toast.success('Cập nhật sản phẩm thành công');
        router.push('/admin/products');
      }, 1000);
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      toast.error('Lỗi khi cập nhật sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href="/admin/products" className="text-blue-600 hover:text-blue-800 mr-2">
          <i className="fas fa-arrow-left"></i> Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                <select
                  name="categoryId" // Changed name
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (₫) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (₫)</label>
                <input
                  type="number"
                  name="salePrice" // Changed name
                  value={formData.salePrice}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn kho <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
               <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label> {/* Thêm mô tả ngắn */}
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label> {/* Giữ lại mô tả chi tiết */}
                 <TinyMCEEditor
                  value={formData.description}
                  onEditorChange={(content: string) => setFormData(prev => ({ ...prev, description: content }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Thông tin SEO</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label> {/* Thêm meta keyword */}
                <input
                  type="text"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              {/* Giữ lại Meta Title và Meta Description nếu cần */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                ></textarea>
              </div> */}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Hình ảnh sản phẩm</h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tải lên hình ảnh</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-1 text-sm text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Xem trước</h3>
                <div className="grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative h-32 w-full rounded-lg overflow-hidden border">
                      <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              'Cập nhật sản phẩm'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;