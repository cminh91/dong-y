import { NextRequest, NextResponse } from 'next/server';

let productCategories = [
  { id: 1, name: 'Herbal Medicine' }
];

export async function GET() {
  return NextResponse.json(productCategories);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newItem = { id: Date.now(), ...data };
  productCategories.push(newItem);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  productCategories = productCategories.map(item => item.id === data.id ? { ...item, ...data } : item);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  productCategories = productCategories.filter(item => item.id !== id);
  return NextResponse.json({ success: true });
}
