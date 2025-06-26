import { NextRequest, NextResponse } from "next/server";
import { checkPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {    // Check permissions
    const hasPermission = await checkPermission(req, ["ADMIN", "STAFF"]);
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền thực hiện thao tác này" },
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

    // Update ID card status to verified
    const updatedIdCard = await prisma.idCard.update({
      where: { id: params.id },
      data: {
        verifiedAt: new Date(),
        rejectedAt: null,
      },
    });

    // If this is their first verified ID card, update user status to ACTIVE
    if (updatedIdCard) {
      const user = await prisma.user.findUnique({
        where: { id: idCard.userId },
        include: {
          idCards: true,
          bankAccounts: true
        }
      });

      if (user) {
        // Check if this is their first verified ID card
        const hasOtherVerifiedIdCards = user.idCards.some(
          card => card.id !== params.id && card.verifiedAt
        );

        // Check if user has valid bank account
        const hasValidBankAccount = user.bankAccounts.length > 0;

        // If this is first verified ID card and user has bank account, activate user
        if (!hasOtherVerifiedIdCards && hasValidBankAccount && user.status === "INACTIVE") {
          await prisma.user.update({
            where: { id: user.id },
            data: { status: "ACTIVE" }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "ID card verified successfully",
      },
    });
  } catch (error) {
    console.error("Error verifying ID card:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
