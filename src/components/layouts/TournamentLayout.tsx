'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TournamentTab = {
  label: string;
  href: string;
  isActive: boolean;
};

type TournamentLayoutProps = {
  children: React.ReactNode;
};

export default function TournamentLayout({ children }: TournamentLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const tournamentId = params.tournamentId as string;
  
  // Base path for tournament routes
  const basePath = `/tournaments/${tournamentId}`;
  
  const tabs: TournamentTab[] = [
    {
      label: 'Overview',
      href: `${basePath}`,
      isActive: pathname === basePath,
    },
    {
      label: 'Matches',
      href: `${basePath}/matches`,
      isActive: pathname === `${basePath}/matches`,
    },
    {
      label: 'Players',
      href: `${basePath}/players`,
      isActive: pathname === `${basePath}/players`,
    },
    {
      label: 'Schedule',
      href: `${basePath}/schedule`,
      isActive: pathname === `${basePath}/schedule`,
    },
    {
      label: 'Brackets',
      href: `${basePath}/brackets`,
      isActive: pathname === `${basePath}/brackets`,
    },
    {
      label: 'Settings',
      href: `${basePath}/settings`,
      isActive: pathname === `${basePath}/settings`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tournament Management</h1>
          <p className="text-muted-foreground">
            Manage all aspects of your tournament in one place.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <nav className="flex border-b border-gray-200 dark:border-gray-700 -mb-px">
            {tabs.map((tab) => (
              <Link 
                key={tab.href}
                href={tab.href}
                className={cn(
                  "py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 transition-colors",
                  tab.isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <Card>
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 