import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScoreHub - Tournament Management for Padel",
  description: "Comprehensive tournament management system for padel clubs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
