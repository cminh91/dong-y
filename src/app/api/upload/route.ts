import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    // Luôn sử dụng folder 'upload', bỏ qua folder parameter
    const folder = 'upload';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists - save outside public folder
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles: Array<{
      url: string;
      filename: string;
      size: number;
      type: string;
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

      // Validate file size (10MB max)
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

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = path.extname(file.name);
        const fileNameWithoutExt = file.name.replace(fileExtension, '').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${fileNameWithoutExt}_${timestamp}_${randomString}${fileExtension}`;

        // Save file to local directory
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Create URL for accessing the file via API
        const fileUrl = `/api/uploads/${folder}/${filename}`;

        uploadedFiles.push({
          url: fileUrl,
          filename: filename,
          size: file.size,
          type: file.type,
          original_filename: file.name
        });

      } catch (uploadError) {
        console.error('Error saving file:', uploadError);
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
        message: `Successfully uploaded ${uploadedFiles.length} file(s) to uploads/${folder}`
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

// DELETE endpoint to remove files from local storage
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file_path');

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'file_path parameter is required' },
        { status: 400 }
      );
    }

    // Security check: ensure the file path is within uploads directory
    if (!filePath.startsWith('/api/uploads/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file path' },
        { status: 400 }
      );
    }

    try {
      // Convert API path to file system path
      const relativePath = filePath.replace('/api/uploads/', '');
      const fullPath = path.join(process.cwd(), 'uploads', relativePath);
      
      // Check if file exists
      if (!existsSync(fullPath)) {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        );
      }

      // Delete the file
      const { unlink } = await import('fs/promises');
      await unlink(fullPath);

      return NextResponse.json({
        success: true,
        message: `Successfully deleted file: ${filePath}`
      });
    } catch (deleteError) {
      console.error('Error deleting file:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete file' },
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

// GET endpoint to check upload configuration
export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const uploadsExists = existsSync(uploadsDir);

    return NextResponse.json({
      success: true,
      data: {
        uploads_configured: uploadsExists,
        uploads_path: uploadsDir,
        message: uploadsExists
          ? 'Local uploads directory is ready'
          : 'Uploads directory will be created on first upload'
      }
    });

  } catch (error) {
    console.error('Error checking upload config:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
