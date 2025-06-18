import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary configuration is missing' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'general'; // Optional folder parameter

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadedFiles: Array<{
      url: string;
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
      original_filename: string;
    }> = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} is not an image` },
          { status: 400 }
        );
      }

      // Validate file size (10MB max for Cloudinary)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} is too large. Max size is 10MB` },
          { status: 400 }
        );
      }

      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique public_id
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileNameWithoutExt = file.name.split('.')[0];
        const publicId = `${folder}/${fileNameWithoutExt}_${timestamp}_${randomString}`;

        // Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, {
          folder: folder,
          public_id: publicId,
          resource_type: 'image',
          transformation: {
            quality: 'auto',
            fetch_format: 'auto'
          }
        });

        uploadedFiles.push({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          original_filename: file.name
        });

      } catch (uploadError) {
        console.error('Error uploading file to Cloudinary:', uploadError);
        return NextResponse.json(
          { success: false, error: `Failed to upload ${file.name}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        files: uploadedFiles,
        message: `Successfully uploaded ${uploadedFiles.length} file(s) to Cloudinary`
      }
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove files from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'public_id parameter is required' },
        { status: 400 }
      );
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary configuration is missing' },
        { status: 500 }
      );
    }

    try {
      await deleteFromCloudinary(publicId);

      return NextResponse.json({
        success: true,
        message: `Successfully deleted image with public_id: ${publicId}`
      });
    } catch (deleteError) {
      console.error('Error deleting from Cloudinary:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete image from Cloudinary' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in DELETE endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for Cloudinary configuration check
export async function GET() {
  try {
    const isConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      success: true,
      data: {
        cloudinary_configured: isConfigured,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || null,
        message: isConfigured
          ? 'Cloudinary is properly configured'
          : 'Cloudinary configuration is missing'
      }
    });

  } catch (error) {
    console.error('Error checking Cloudinary config:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
