import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = (await params).path.join('/');
    
    // Security check: prevent directory traversal
    if (filePath.includes('..') || filePath.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Construct full file path
    const fullPath = path.join(process.cwd(), 'uploads', filePath);
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      const placeholderPath = path.join(process.cwd(), 'public', 'images', 'placeholder.png');
      if (existsSync(placeholderPath)) {
        const placeholderBuffer = await readFile(placeholderPath);
        return new NextResponse(placeholderBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Length': placeholderBuffer.length.toString(),
          },
        });
      } else {
        return NextResponse.json(
          { error: 'File not found and no placeholder available' },
          { status: 404 }
        );
      }
    }

    // Read file
    const fileBuffer = await readFile(fullPath);
    
    // Get file extension to set correct MIME type
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
