import { NextRequest, NextResponse } from 'next/server';

let testimonialsSections = [
  { id: 1, name: 'John Doe', testimonial: 'Great service!' }
];

export async function GET() {
  return NextResponse.json(testimonialsSections);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newItem = { id: Date.now(), ...data };
  testimonialsSections.push(newItem);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  testimonialsSections = testimonialsSections.map(item => item.id === data.id ? { ...item, ...data } : item);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  testimonialsSections = testimonialsSections.filter(item => item.id !== id);
  return NextResponse.json({ success: true });
}
