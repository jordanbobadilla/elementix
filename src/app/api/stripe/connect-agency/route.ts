import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code, agencyId } = await req.json();

  if (!code || !agencyId) {
    return new NextResponse("Missing code or agencyId", { status: 400 });
  }

  try {
    const tokenResponse = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    const connectedAccountId = tokenResponse.stripe_user_id;

    if (!connectedAccountId) {
      return new NextResponse("No connected Stripe account returned", {
        status: 400,
      });
    }

    await db.agency.update({
      where: { id: agencyId },
      data: { connectedAccountId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error connecting Stripe account:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
