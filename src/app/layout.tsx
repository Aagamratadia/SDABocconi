// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers'; // Import the new provider component
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Receipt Uploader App',
  description: 'Upload and manage receipts',
};

// This is now a clean, pure Server Component.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* The Providers component handles all client-side context */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
