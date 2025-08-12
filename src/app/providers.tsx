// src/app/providers.tsx
"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { ReactNode, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

// This component will bundle all client-side context providers.
// If you add more providers (e.g., for a theme), you would wrap them here.
export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevIndexRef = useRef<number>(0);
  // Define a simple order for direction: lower -> higher slides L->R
  const routeOrder = useMemo(() => ({
    "/": 0,
    "/register": 1,
  } as Record<string, number>), []);
  const currentIndex = routeOrder[pathname] ?? 0;
  // Keep ref update but use only opacity crossfade to avoid layout thrash
  const direction = currentIndex >= prevIndexRef.current ? 1 : -1;
  prevIndexRef.current = currentIndex;

  return (
    <AuthProvider>
      <div style={{ overflow: 'hidden' }} className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: direction * 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -16 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{ willChange: "opacity, transform" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthProvider>
  );
}
