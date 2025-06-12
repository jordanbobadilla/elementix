'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LaunchpadClient({ subaccountId }: { subaccountId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code || !subaccountId) return;

    const connectStripe = async () => {
      try {
        const res = await fetch("/api/stripe/connect-subaccount", {
          method: "POST",
          body: JSON.stringify({ code, subaccountId }),
        });

        if (res.ok) {
          console.log("✅ Stripe account connected");
          router.replace(`/subaccount/${subaccountId}/launchpad`);
        } else {
          console.error("❌ Failed to connect Stripe account");
        }
      } catch (err) {
        console.error("❌ Network error connecting Stripe account:", err);
      }
    };

    connectStripe();
  }, [code, subaccountId, router]);

  return null;
}
