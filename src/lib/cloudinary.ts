import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = async (
  buffer: Buffer,
  options: {
    folder?: string;
    public_id?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    transformation?: any;
  } = {}
): Promise<{
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: options.resource_type || 'auto',
      folder: options.folder || 'dongypharmacy',
      public_id: options.public_id,
      transformation: options.transformation,
      ...options
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            url: result.url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          });
        } else {
          reject(new Error('Upload failed - no result'));
        }
      }
    ).end(buffer);
  });
};

// Helper function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string => {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto',
    format: options.format || 'auto',
    fetch_format: 'auto'
  });
};
