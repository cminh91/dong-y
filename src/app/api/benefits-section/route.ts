import { NextRequest, NextResponse } from 'next/server';

let benefitsSections = [
  { id: 1, benefit: 'Free shipping' }
];

export async function GET() {
  return NextResponse.json(benefitsSections);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newItem = { id: Date.now(), ...data };
  benefitsSections.push(newItem);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  benefitsSections = benefitsSections.map(item => item.id === data.id ? { ...item, ...data } : item);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  benefitsSections = benefitsSections.filter(item => item.id !== id);
  return NextResponse.json({ success: true });
}
