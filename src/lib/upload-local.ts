// Helper functions for local file upload
export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
  original_filename: string;
}

export interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

/**
 * Upload files to local uploads directory
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  // Validate files before upload
  for (const file of files) {
    if (file.size > maxSize) {
      throw new Error(`File ${file.name} is too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB`);
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File ${file.name} type not allowed. Allowed: ${allowedTypes.join(', ')}`);
    }
  }

  const formData = new FormData();
  
  // Add files to form data
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Upload failed');
  }

  return result.data.files;
}

/**
 * Delete a file from local uploads directory
 */
export async function deleteFile(filePath: string): Promise<void> {
  const response = await fetch(`/api/upload?file_path=${encodeURIComponent(filePath)}`, {
    method: 'DELETE',
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Delete failed');
  }
}

/**
 * Get full URL for uploaded file
 */
export function getFileUrl(path: string): string {
  // Ensure path starts with /uploads/
  if (!path.startsWith('/uploads/')) {
    path = `/uploads/${path}`;
  }
  
  // In production, you might want to add your domain
  // return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;
  
  return path;
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Get upload configuration
 */
export async function getUploadConfig() {
  const response = await fetch('/api/upload', {
    method: 'GET',
  });

  const result = await response.json();
  return result;
}
