// src/hooks/useAuth.tsx
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Using alias for cleaner import

// Define the type for the user role
type UserRole = 'admin' | 'user' | null;

// Define the type for the context value
interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// This is the provider component that holds the state logic
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get the ID token result which contains custom claims
          const idTokenResult = await user.getIdTokenResult();
          // Check if the user has the admin claim
          const isAdmin = idTokenResult.claims.admin === true;
          const userRole: UserRole = isAdmin ? 'admin' : 'user';
          
          setUser(user);
          setRole(userRole);
        } catch (error) {
          console.error('Error getting user claims:', error);
          setUser(user);
          setRole('user'); // Default to user role if there's an error
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, role, loading };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// This is the custom hook that components will use to access the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
