'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { User, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default function Header() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-xl text-primary">
            ScoreHub
          </Link>
          
          <nav className="hidden md:flex ml-10 space-x-6">
            <Link href="/tournaments" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Tournaments
            </Link>
            {user && (
              <>
                <Link href="/my-tournaments" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  My Tournaments
                </Link>
                <Link href="/clubs" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  Clubs
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeSwitcher />
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <ThemeSwitcher />
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2">
          <nav className="flex flex-col space-y-3 py-3">
            <Link href="/tournaments" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Tournaments
            </Link>
            {user && (
              <>
                <Link href="/my-tournaments" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  My Tournaments
                </Link>
                <Link href="/clubs" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  Clubs
                </Link>
              </>
            )}
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut()} className="flex items-center w-full justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                <Link href="/signin">
                  <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
} 