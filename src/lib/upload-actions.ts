'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('Không có file được tải lên')
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Chỉ cho phép tải lên file ảnh')
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Kích thước file không được vượt quá 5MB')
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`
    const filepath = join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/${filename}`
    
    return {
      success: true,
      url: publicUrl,
      filename: filename
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw new Error(error instanceof Error ? error.message : 'Lỗi khi tải lên file')
  }
}
