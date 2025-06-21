import { NextRequest, NextResponse } from 'next/server';

let aboutSections = [
  { id: 1, title: 'About Us', content: 'We are a leading pharmacy.' }
];

export async function GET() {
  return NextResponse.json(aboutSections);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newItem = { id: Date.now(), ...data };
  aboutSections.push(newItem);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  aboutSections = aboutSections.map(item => item.id === data.id ? { ...item, ...data } : item);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  aboutSections = aboutSections.filter(item => item.id !== id);
  return NextResponse.json({ success: true });
}
