// app/layout.tsx
import './globals.css';
import { Toaster } from 'sonner'; // ✅ Toast component from sonner
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moovr Admin Panel',
  description: 'Created by Uzair S.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Place Toaster above children */}
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
