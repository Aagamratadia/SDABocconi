"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    }
  };
  
  // Shows a loading spinner while checking auth state
  if (loading || (!loading && user)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#003E68]"></div>
        </div>
      );
  }

  return (
    <main 
      className="flex items-center justify-center min-h-screen font-sans" 
      style={{ 
        // The external URL has been replaced with an embedded SVG data URL.
        // This ensures the background pattern always loads reliably.
        backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(229 231 235 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")"
      }}
    >
      <div className="relative w-full max-w-4xl mx-auto flex bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* Left Section: Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-[#003E68] mb-2">Sign In</h1>
            <p className="text-gray-600 mb-8">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-[#003E68] hover:underline">
                Sign up
              </Link>
            </p>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FBCE0C] focus:border-transparent transition"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="current-password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FBCE0C] focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
              
              {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

              <div>
                <button 
                  type="submit" 
                  className="w-full px-4 py-3 text-sm font-bold text-[#003E68] bg-[#FBCE0C] rounded-lg shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-transform transform hover:scale-105"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Section: Decorative Panel */}
        <div className="hidden lg:flex w-1/2 bg-[#003E68] items-center justify-center relative p-12">
           <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: "url('https://www.toptal.com/designers/subtlepatterns/uploads/fancy-cushion.png')"}}></div>
           <div className="z-10 text-white text-left">
              <h2 className="text-4xl font-bold leading-tight mb-4">
                Unlock Your Potential.
              </h2>
              <p className="text-lg text-yellow-200 font-light">
                Access exclusive content and features by signing into your account.
              </p>
           </div>
        </div>

      </div>
    </main>
  );
}
