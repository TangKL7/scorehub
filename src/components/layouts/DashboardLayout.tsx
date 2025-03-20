'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/layout/header';
import { 
  Home, 
  Trophy, 
  Users, 
  Calendar, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  BarChart,
  ClipboardList,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/tournaments', label: 'Tournaments', icon: Trophy },
    { href: '/dashboard/players', label: 'Players', icon: Users },
    { href: '/dashboard/registrations', label: 'Registrations', icon: ClipboardList },
    { href: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
    { href: '/dashboard/venues', label: 'Venues', icon: MapPin },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  if (!user) {
    return <div>You need to be logged in to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-white dark:bg-gray-900 h-[calc(100vh-64px)] sticky top-16 transition-all duration-300 border-r border-gray-200 dark:border-gray-800",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <div className="p-4 flex justify-end">
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          
          <nav className="mt-2 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 my-1 rounded-md transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                    collapsed ? "justify-center" : ""
                  )}
                >
                  <Icon className="h-5 w-5 mr-2 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className={cn(
          "flex-1 p-6",
          collapsed ? "ml-16" : "ml-64"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
} 