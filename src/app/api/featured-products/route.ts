import { NextRequest, NextResponse } from 'next/server';

let featuredProducts = [
  { id: 1, name: 'Ginseng Capsule', price: 100 }
];

export async function GET() {
  return NextResponse.json(featuredProducts);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newItem = { id: Date.now(), ...data };
  featuredProducts.push(newItem);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  featuredProducts = featuredProducts.map(item => item.id === data.id ? { ...item, ...data } : item);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  featuredProducts = featuredProducts.filter(item => item.id !== id);
  return NextResponse.json({ success: true });
}
