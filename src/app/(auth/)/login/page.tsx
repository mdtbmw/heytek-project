export const dynamic = 'force-dynamic';

'use client';
import dynamic from 'next/dynamic';

const LoginForm = dynamic(
  () => import('./LoginForm'),
  { ssr: false }
);

export default function Page() {
  return <LoginForm />;
}