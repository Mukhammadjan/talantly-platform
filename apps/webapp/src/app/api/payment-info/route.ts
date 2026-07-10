import { CV_PRICE_UZS } from "@talantly/shared";
import { NextResponse } from "next/server";
import { requireSession, serverError, unauthorized } from "@/lib/server/auth";
import { serverEnv } from "@/lib/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    return NextResponse.json({
      cardNumber: serverEnv.paymentCardNumber ?? null,
      cardOwner: serverEnv.paymentCardOwner ?? null,
      price: CV_PRICE_UZS,
    });
  } catch (err) {
    console.error("GET /api/payment-info failed:", err);
    return serverError();
  }
}
