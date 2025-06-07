'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LaunchpadClient({ agencyId }: { agencyId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code || !agencyId) return;

    const connectStripe = async () => {
      try {
        const res = await fetch("/api/stripe/connect-agency", {
          method: "POST",
          body: JSON.stringify({ code, agencyId }),
        });

        if (res.ok) {
          console.log("✅ Stripe account connected");
          router.replace(`/agency/${agencyId}/launchpad`);
        } else {
          console.error("❌ Failed to connect Stripe account");
        }
      } catch (err) {
        console.error("❌ Network error connecting Stripe account:", err);
      }
    };

    connectStripe();
  }, [code, agencyId]);

  return null;
}
