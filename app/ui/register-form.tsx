'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { useActionState } from 'react';
import { authenticate, createUser, UserState } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';


export default function RegisterForm() {
  const initialState: UserState = { message: null, errors: {} };

  const [state, formAction] = useActionState(createUser, initialState);

  const [formValues, setFormValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });


  const searchParams = useSearchParams();
  const safeSearchParams = searchParams ?? new URLSearchParams(); // fallback
  const callbackUrl = safeSearchParams.get('callbackUrl') || '/dashboard';
  console.log('Form State:', state);
  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Create an Account
        </h1>
        
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="first_name"
            >
              First Name
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="first_name"
                type="name"
                name="first_name"
                placeholder="John"
                aria-describedby="first_name-error"
                value={formValues.first_name}
                onChange={(e) => {
                  setFormValues({ ...formValues, first_name: e.target.value });
                }}
                // required
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id="first_name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.first_name &&
                state.errors.first_name.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="last_name"
            >
              Last Name
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="last_name"
                type="name"
                name="last_name"
                placeholder="Doe"
                aria-describedby="last_name-error"
                value={formValues.last_name}
                onChange={(e) => {
                  setFormValues({ ...formValues, last_name: e.target.value });
                }}
                // required
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id="last_name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.last_name &&
                state.errors.last_name.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                aria-describedby="email-error"
                value={formValues.email}
                onChange={(e) => {
                  setFormValues({ ...formValues, email: e.target.value });
                }}
                // required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id="email-error" aria-live="polite" aria-atomic="true">
              {state.errors?.email &&
                state.errors.email.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                aria-describedby="password-error"
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id="password-error" aria-live="polite" aria-atomic="true">
              {state.errors?.password &&
                state.errors.password.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <div>
          <Button className="mt-4 w-full" >
          Create Account <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        </div>
        <div className = 'grid content-center items-center justify-items-center mt-4'>
          <Link
            href="/login"
            className="flex items-center gap-5 bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg font-medium self-start text-sm"
            // self-start text-sm text-white transition-colors hover:bg-blue-400 md:text-base"
          >
            <span>Existing User?</span>
          </Link>
        </div>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {state.message && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{state.message}</p>
            </>
          )}
          
        </div>
      </div>

    </form>
  );
}
