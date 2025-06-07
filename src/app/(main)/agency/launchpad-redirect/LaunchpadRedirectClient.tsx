'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LaunchpadRedirectClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      console.error('❌ Faltan parámetros de Stripe');
      return;
    }

    const [path, agencyId] = state.split('___');

    if (!path || !agencyId) {
      console.error('❌ Parámetros inválidos');
      return;
    }

    router.replace(`/agency/${agencyId}/${path}?code=${code}`);
  }, [router, searchParams]);

  return <div>Redirigiendo...</div>;
}
