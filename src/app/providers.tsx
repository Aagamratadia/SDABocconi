// src/app/providers.tsx
"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { ReactNode } from "react";

// This component will bundle all client-side context providers.
// If you add more providers (e.g., for a theme), you would wrap them here.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
