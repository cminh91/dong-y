import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const contactSection = await prisma.contactSection.findFirst();
    if (!contactSection) {
      // Optionally, return default data or an empty object if nothing is configured yet
      return NextResponse.json({
        address: '123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
        phone: '1900 1234',
        email: 'cskh@dongypharmacy.com',
        workingHours: 'Thứ 2 - Chủ nhật: 8:00 - 20:00',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5177580567037!2d106.69916121471856!3d10.771594992323746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a3b49e59%3A0xa1bd14e483a602db!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIFRQLkhDTQ!5e0!3m2!1svi!2s!4v1620879158277!5m2!1svi!2s',
      });
    }
    return NextResponse.json(contactSection);
  } catch (error) {
    console.error('[GET_CONTACT_SECTION]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
