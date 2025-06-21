import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createLevelSchema = z.object({
  level: z.number().min(1).max(10),
  commissionRate: z.number().min(0).max(1), // 0 to 1 (0% to 100%)
  description: z.string().optional(),
  isActive: z.boolean().default(true)
});

const updateLevelSchema = z.object({
  commissionRate: z.number().min(0).max(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional()
});

// GET /api/admin/commission-levels - Get all commission level settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const levels = await prisma.commissionLevelSetting.findMany({
      where,
      orderBy: { level: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: levels.map(level => ({
        ...level,
        commissionRate: Number(level.commissionRate),
        commissionRatePercent: Number(level.commissionRate * 100)
      }))
    });

  } catch (error) {
    console.error('Error fetching commission levels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commission levels' },
      { status: 500 }
    );
  }
}

// POST /api/admin/commission-levels - Create new commission level
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLevelSchema.parse(body);

    // Check if level already exists
    const existingLevel = await prisma.commissionLevelSetting.findUnique({
      where: { level: validatedData.level }
    });

    if (existingLevel) {
      return NextResponse.json(
        { success: false, error: `Level ${validatedData.level} already exists` },
        { status: 400 }
      );
    }

    const newLevel = await prisma.commissionLevelSetting.create({
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newLevel,
        commissionRate: Number(newLevel.commissionRate),
        commissionRatePercent: Number(newLevel.commissionRate * 100)
      },
      message: 'Commission level created successfully'
    });

  } catch (error) {
    console.error('Error creating commission level:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create commission level' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/commission-levels - Update multiple levels
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { levels } = z.object({
      levels: z.array(z.object({
        id: z.string(),
        commissionRate: z.number().min(0).max(1).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional()
      }))
    }).parse(body);

    const results = [];

    for (const levelData of levels) {
      const { id, ...updateData } = levelData;
      
      const updatedLevel = await prisma.commissionLevelSetting.update({
        where: { id },
        data: updateData
      });

      results.push({
        ...updatedLevel,
        commissionRate: Number(updatedLevel.commissionRate),
        commissionRatePercent: Number(updatedLevel.commissionRate * 100)
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Updated ${results.length} commission levels`
    });

  } catch (error) {
    console.error('Error updating commission levels:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update commission levels' },
      { status: 500 }
    );
  }
}
