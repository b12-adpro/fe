// app/page.tsx
'use client';  // Menandakan ini adalah client-side component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';  // Gunakan useRouter dari next/navigation

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard'); // Redirect ke dashboard
  }, [router]);

  return <div>Redirecting to Dashboard...</div>;
}
