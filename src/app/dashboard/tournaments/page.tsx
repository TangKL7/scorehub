'use client';

import React from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { PageHeader, PageHeaderAction } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';

// Mock tournament data
const myTournaments = [
  {
    id: '1',
    title: 'Summer Padel Championship',
    date: '2023-08-15',
    location: 'Barcelona Padel Club',
    format: 'Double Elimination',
    participants: 24,
    status: 'Organizing',
  },
  {
    id: '2',
    title: 'Weekend Padel Tournament',
    date: '2023-07-28',
    location: 'Madrid Central Courts',
    format: 'Round Robin',
    participants: 16,
    status: 'Registration Open',
  },
  {
    id: '3',
    title: 'Local Club Challenge',
    date: '2023-09-05',
    location: 'Your Padel Club',
    format: 'Single Elimination',
    participants: 8,
    status: 'Draft',
  },
  {
    id: '4',
    title: 'Friendly Doubles Cup',
    date: '2023-10-12',
    location: 'Community Sports Center',
    format: 'Round Robin',
    participants: 12,
    status: 'Draft',
  },
];

export default function DashboardTournamentsPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="My Tournaments"
        description="Manage tournaments you've created or are organizing"
        actions={
          <PageHeaderAction primary href="/dashboard/tournaments/create">
            Create Tournament
          </PageHeaderAction>
        }
      />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Tournament List</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Sort
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTournaments.map((tournament) => (
            <Card key={tournament.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{tournament.title}</span>
                  <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {tournament.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{new Date(tournament.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{tournament.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Trophy className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{tournament.format}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{tournament.participants} participants</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/dashboard/tournaments/${tournament.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 