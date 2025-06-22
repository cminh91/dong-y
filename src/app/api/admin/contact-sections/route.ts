import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const contactSectionSchema = z.object({
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  mapUrl: z.string().optional().or(z.literal('')), // Chấp nhận chuỗi bất kỳ, không cần là URL
  workingHours: z.string().optional(),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

export async function GET() {
  try {
    const contactSection = await prisma.contactSection.findFirst();
    return NextResponse.json(contactSection);
  } catch (error) {
    console.error('[GET_CONTACT_SECTION]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = contactSectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { address, phone, email, mapUrl, workingHours, facebookUrl, twitterUrl, instagramUrl, youtubeUrl, linkedinUrl } = validation.data;

    const existingSection = await prisma.contactSection.findFirst();

    if (existingSection) {
      const updatedSection = await prisma.contactSection.update({
        where: { id: existingSection.id },
        data: {
          address,
          phone,
          email,
          mapUrl: mapUrl || '',
          workingHours,
          facebookUrl,
          twitterUrl,
          instagramUrl,
          youtubeUrl,
          linkedinUrl,
        },
      });
      return NextResponse.json(updatedSection);
    } else {
      const newSection = await prisma.contactSection.create({
        data: {
          address,
          phone,
          email,
          mapUrl: mapUrl || '',
          workingHours: workingHours || '',
          facebookUrl: facebookUrl || '',
          twitterUrl: twitterUrl || '',
          instagramUrl: instagramUrl || '',
          youtubeUrl: youtubeUrl || '',
          linkedinUrl: linkedinUrl || '',
        },
      });
      return NextResponse.json(newSection, { status: 201 });
    }
  } catch (error) {
    console.error('[ADMIN_POST_CONTACT_SECTION]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
