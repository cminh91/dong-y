import { NextRequest, NextResponse } from "next/server";
import { checkPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permissions
    const hasPermission = await checkPermission(req, ["ADMIN"]);
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get ID card by ID
    const idCard = await prisma.idCard.findUnique({
      where: { id: params.id },
    });

    if (!idCard) {
      return NextResponse.json(
        { success: false, error: "ID card not found" },
        { status: 404 }
      );
    }

    // Check if ID card is already verified or rejected
    if (idCard.verifiedAt || idCard.rejectedAt) {
      return NextResponse.json(
        { success: false, error: "ID card is already verified or rejected" },
        { status: 400 }
      );
    }

    // Update ID card status to rejected
    const updatedIdCard = await prisma.idCard.update({
      where: { id: params.id },
      data: {
        rejectedAt: new Date(),
        verifiedAt: null,
      },
    });

    if (updatedIdCard) {
      const user = await prisma.user.findUnique({
        where: { id: idCard.userId },
        include: {
          idCards: true,
        },
      });

      if (user) {
        // Check if user has any other verified ID cards
        const hasVerifiedIdCards = user.idCards.some(
          (card) => card.id !== params.id && card.verifiedAt
        );

        // If no verified ID cards, set user status to INACTIVE
        if (!hasVerifiedIdCards && user.status === "ACTIVE") {
          await prisma.user.update({
            where: { id: user.id },
            data: { status: "INACTIVE" },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "ID card rejected successfully",
      },
    });
  } catch (error) {
    console.error("Error rejecting ID card:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
