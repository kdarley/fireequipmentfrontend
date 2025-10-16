import AcmeLogo from '@/app/ui/acme-logo';
import LoginForm from '@/app/ui/login-form';
import { Suspense } from 'react';
// import Image from 'next/image';
import DarleyLogo from '@/app/ui/darley-logo';
export const revalidate = 0;
 
export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-12">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-24">
          <div className="w-48 text-white md:w-64">
            <DarleyLogo />
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>      
    </main>
  );
}