"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { auth, db } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

// --- Animation variants are unchanged ---
const signInVariants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};
const registerVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
};
const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};


// --- Sign In Form Component (No changes inside) ---
const SignInForm = ({ onSwitchMode }: { onSwitchMode: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-[#003E68] mb-2">Sign In</h1>
      <p className="text-gray-600 mb-8">
        Don&rsquo;t have an account?{' '}
        <button type="button" onClick={onSwitchMode} className="font-semibold text-[#003E68] hover:underline focus:outline-none">
          Sign up
        </button>
      </p>
      <form className="space-y-5" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email-login" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input id="email-login" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FBCE0C] focus:border-transparent transition" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input id="password-login" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FBCE0C] focus:border-transparent transition" placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
        <div>
          <button type="submit" className="w-full px-4 py-3 text-sm font-bold text-[#003E68] bg-[#FBCE0C] rounded-lg shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-transform transform hover:scale-105">
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};


// --- Register Form Component (No changes inside) ---
const RegisterForm = ({ onSwitchMode }: { onSwitchMode: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password should be at least 6 characters long.");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: 'user',
        createdAt: new Date(),
      });
    } catch (err) {
      if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-[#003E68] mb-2">Sign Up</h1>
      <p className="text-gray-600 mb-8">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchMode} className="font-semibold text-[#003E68] hover:underline focus:outline-none">
          Sign in
        </button>
      </p>
      <form className="space-y-5" onSubmit={handleRegister}>
        <div>
            <label htmlFor="email-register" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input id="email-register" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FBCE0C] focus:border-transparent transition" placeholder="you@example.com"/>
        </div>
        <div>
            <label htmlFor="password-register" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="password-register" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FBCE0C] focus:border-transparent transition" placeholder="6+ characters"/>
        </div>
        <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FBCE0C] focus:border-transparent transition" placeholder="••••••••"/>
        </div>
        {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
        <div>
            <button type="submit" className="w-full px-4 py-3 text-sm font-bold text-[#003E68] bg-[#FBCE0C] rounded-lg shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-transform transform hover:scale-105">
                Create Account
            </button>
        </div>
      </form>
    </div>
  );
};


// --- Main Page Component ---
export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  const toggleMode = () => setIsRegister(prev => !prev);

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
        backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(229 231 235 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
      }}
    >
      {/* --- THIS IS THE ONLY CHANGE --- */}
      {/* We conditionally add 'lg:flex-row-reverse' to flip the layout for the register view */}
      <div className={`relative w-full max-w-4xl mx-auto flex ${isRegister ? 'lg:flex-row-reverse' : ''} bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500`}>
        
        {/* Animated Form Area (Now appears on left for sign-in, right for register) */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {isRegister ? (
              <motion.div key="register" variants={registerVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, ease: 'easeInOut' }}>
                <RegisterForm onSwitchMode={toggleMode} />
              </motion.div>
            ) : (
              <motion.div key="login" variants={signInVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, ease: 'easeInOut' }}>
                <SignInForm onSwitchMode={toggleMode} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decorative Panel (Now appears on right for sign-in, left for register) */}
        <div className="hidden lg:flex w-1/2 bg-[#003E68] items-center justify-center relative p-12">
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: "url('https://www.toptal.com/designers/subtlepatterns/uploads/fancy-cushion.png')"}}></div>
          <div className="z-10 text-white text-left">
            <div className="mb-6">
              <Image src="/logo.png" alt="SDA Bocconi" width={160} height={46} priority />
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={isRegister ? 'register-text' : 'login-text'} variants={textVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, ease: 'easeInOut' }}>
                {isRegister ? (
                    <div>
                        <h2 className="text-4xl font-bold leading-tight mb-4">Create your account</h2>
                        <p className="text-lg text-yellow-200 font-light">Register to submit and manage your payment receipts.</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-4xl font-bold leading-tight mb-4">Sign in to your Account</h2>
                        <p className="text-lg text-yellow-200 font-light">Please sign in to submit and manage your payment receipts.</p>
                    </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}