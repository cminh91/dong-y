import { NextRequest, NextResponse } from 'next/server';

let contactSections = [
  { id: 1, email: 'info@example.com', phone: '123456789' }
];

export async function GET() {
  return NextResponse.json(contactSections);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newItem = { id: Date.now(), ...data };
  contactSections.push(newItem);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  contactSections = contactSections.map(item => item.id === data.id ? { ...item, ...data } : item);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  contactSections = contactSections.filter(item => item.id !== id);
  return NextResponse.json({ success: true });
}
