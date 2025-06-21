import { NextRequest, NextResponse } from 'next/server';

// Dummy data, replace with DB logic
let heroSections = [
  { id: 1, title: 'Welcome', description: 'Welcome to our site!' }
];

export async function GET() {
  return NextResponse.json(heroSections);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newItem = { id: Date.now(), ...data };
  heroSections.push(newItem);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  heroSections = heroSections.map(item => item.id === data.id ? { ...item, ...data } : item);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  heroSections = heroSections.filter(item => item.id !== id);
  return NextResponse.json({ success: true });
}
