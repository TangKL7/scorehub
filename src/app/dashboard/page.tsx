'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Tournament, TournamentStatus } from '@/types/database.types';
import { CalendarDays, Trophy, Users, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent tournaments
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (tournamentError) throw tournamentError;
      setTournaments(tournamentData || []);

      // We would also fetch upcoming matches here
      // For now, using empty array as placeholder
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/tournaments/new">
              <Button>Create Tournament</Button>
            </Link>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex flex-row items-center p-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Tournaments
                </p>
                <h3 className="text-2xl font-bold">
                  {loading ? '...' : tournaments.filter(t => t.status === 'active').length}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-row items-center p-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Registered Players
                </p>
                <h3 className="text-2xl font-bold">
                  {loading ? '...' : tournaments.reduce((acc, t) => acc + (t.max_participants || 0), 0)}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-row items-center p-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming Matches
                </p>
                <h3 className="text-2xl font-bold">
                  {loading ? '...' : upcomingMatches.length}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-row items-center p-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Courts Available
                </p>
                <h3 className="text-2xl font-bold">5</h3>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent tournaments */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Tournaments</CardTitle>
              <CardDescription>
                Your latest tournaments and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading tournaments...</div>
              ) : tournaments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Start Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tournaments.map((tournament) => (
                        <tr key={tournament.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm font-medium">{tournament.title}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(tournament.start_date)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tournament.status === 'in_progress' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                                : tournament.status === 'draft'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            }`}>
                              {tournament.status.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <Link href={`/tournaments/${tournament.id}`}>
                              <Button variant="ghost" size="sm">View</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No tournaments found</p>
                  <Link href="/tournaments/new">
                    <Button>Create Your First Tournament</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Upcoming matches */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Matches</CardTitle>
              <CardDescription>
                Matches scheduled for today and tomorrow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming matches</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 