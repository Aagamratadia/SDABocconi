// src/app/register/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { auth, db } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

// The component is defined here and exported as the default at the end.
function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Redirect authenticated users to the dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }
    // No phone number required

    try {
      // 1. Create the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // 2. Save additional user info to a 'users' collection in Firestore
      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        email: newUser.email,
        role: 'user',
        createdAt: new Date(),
      });

    } catch (err: unknown) {
      if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
      console.error(err);
    }
  };

  // Match loading UI to login page
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
        backgroundImage:
          "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(229 231 235 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
      }}
    >
      <div className="relative w-full max-w-3xl mx-auto flex lg:flex-row-reverse bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Left Section: Form */}
        <motion.div
          className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-center"
          initial={false}
        >
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-[#003E68] mb-2">Sign Up</h1>
            <p className="text-gray-600 mb-8">
              Already have an account?{' '}
              <Link href="/" className="font-semibold text-[#003E68] hover:underline">
                Sign in
              </Link>
            </p>

            <form className="space-y-5" onSubmit={handleRegister}>
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FBCE0C] focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FBCE0C] focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 text-sm font-bold text-[#003E68] bg-[#FBCE0C] rounded-lg shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-transform transform hover:scale-105"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Right Section: Decorative Panel */}
        <motion.div
          className="hidden lg:flex w-1/2 bg-[#003E68] items-center justify-center relative p-10"
          initial={false}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: "url('https://www.toptal.com/designers/subtlepatterns/uploads/fancy-cushion.png')" }}
          ></div>
          <div className="z-10 text-white text-left">
            <div className="mb-6">
              <Image src="/logo.png" alt="SDA Bocconi" width={160} height={46} priority />
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4">Create your account</h2>
            <p className="text-lg text-yellow-200 font-light">Register to submit and manage your payment receipts.</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

// There should only be ONE default export per file.
export default RegisterPage;
