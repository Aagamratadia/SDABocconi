"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import AdminView from '@/components/AdminView';
import UserView from '@/components/UserView';

export default function DashboardPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <span
            className="h-12 w-12 animate-spin rounded-full border-4 border-[#003E68]/20 border-t-[#FBCE0C]"
            aria-hidden
          />
          <p className="text-sm tracking-wide text-[#003E68]">Loading Dashboard…</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="relative z-10 border-b-4 border-[#FBCE0C] bg-[#003E68] shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBCE0C] text-[#003E68] font-extrabold">
                GI
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
                </h1>
                <p className="text-xs text-white/70">Welcome, {user.email}</p>
              </div>
              <span className="ml-2 hidden rounded-full bg-[#FBCE0C] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#003E68] sm:inline">
                {role}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FBCE0C] px-4 py-2 text-sm font-semibold text-[#003E68] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#FBCE0C]/40 active:translate-y-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 12h9m0 0-3-3m3 3-3 3"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Subheader / Breadcrumb bar */}
        <div className="bg-gradient-to-r from-[#003E68]/0 via-[#003E68]/5 to-[#003E68]/0">
          <div className="mx-auto max-w-7xl px-4 py-3 text-sm text-[#003E68] sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FBCE0C]" />
              <span className="font-medium">Overview</span>
              <span className="text-[#003E68]/50">•</span>
              <span className="text-[#003E68]/70">Quick access to your tools</span>
            </div>
          </div>
        </div>

        {/* Main */}
        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Elevated container for the main view (visual only) */}
            <div className="rounded-2xl border border-[#003E68]/10 bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[#003E68]">
                  <span className="inline-block h-5 w-1.5 rounded-full bg-[#FBCE0C]" />
                  {role === 'admin' ? 'Admin Tools' : 'Your Workspace'}
                </h2>
                <span className="rounded-full border border-[#003E68]/15 bg-[#003E68]/5 px-3 py-1 text-xs font-medium text-[#003E68]">
                  Signed in
                </span>
              </div>

              {/* Conditionally render the correct view based on the user's role */}
              <div className="">
                {role === 'admin' ? <AdminView /> : <UserView />}
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-6 text-center text-xs text-[#003E68]/60">
              © {new Date().getFullYear()} SDA Bocconi • All rights reserved
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}