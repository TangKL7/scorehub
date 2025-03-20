'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Header from './header';
import {
  Trophy,
  Users,
  Calendar,
  Settings,
  Home,
  ClipboardList,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    // You could add a redirect here if you want
    return null;
  }

  const navItems: NavItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: 'My Tournaments',
      href: '/dashboard/tournaments',
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      label: 'Registrations',
      href: '/dashboard/registrations',
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Players',
      href: '/dashboard/players',
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Schedule',
      href: '/dashboard/schedule',
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: 'Venues',
      href: '/dashboard/venues',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      href: '/dashboard/settings',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed top-[61px] left-0 z-30 h-[calc(100vh-61px)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
            collapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="flex-1 py-4 overflow-y-auto">
              <nav className="space-y-1 px-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center text-sm px-3 py-3 rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <span className={`${collapsed ? '' : 'mr-3'}`}>
                        {item.icon}
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Collapse button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-center"
              >
                {collapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <>
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    <span>Collapse</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={`flex-1 pt-6 pb-12 transition-all duration-300 ${
            collapsed ? 'ml-16' : 'ml-64'
          } mt-[61px]`}
        >
          <div className="container px-4 mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 