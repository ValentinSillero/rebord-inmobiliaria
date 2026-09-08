'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButton({ fallbackHref = '/' }: { fallbackHref?: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return <button type="button" className="back-button" onClick={goBack} aria-label="Volver"><ArrowLeft aria-hidden="true" /></button>;
}
