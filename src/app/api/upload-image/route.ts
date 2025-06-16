import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('image') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename using Node.js built-in crypto
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${fileExtension}`;
    
    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, filename);

    // Create uploads directory if it doesn't exist
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      // If directory doesn't exist, create it and try again
      const { mkdir } = await import('fs/promises');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(filePath, buffer);
    }

    // Return the public URL
    const imageUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ 
      url: imageUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 