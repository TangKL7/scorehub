'use client';

import React from 'react';
import Header from '@/components/layout/header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-6 pb-12">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      <footer className="py-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} ScoreHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 