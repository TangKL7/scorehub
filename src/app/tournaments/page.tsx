'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { Tournament, TournamentStatus } from '@/types/database.types';
import { Search, Plus, Filter } from 'lucide-react';

export default function TournamentsPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | 'all'>('all');

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    filterTournaments();
  }, [tournaments, searchQuery, statusFilter]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
      setFilteredTournaments(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setLoading(false);
    }
  };

  const filterTournaments = () => {
    let filtered = [...tournaments];
    
    // Apply search query filter
    if (searchQuery) {
      filtered = filtered.filter(tournament => 
        tournament.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tournament => tournament.status === statusFilter);
    }
    
    setFilteredTournaments(filtered);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <Link href="/tournaments/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </Link>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tournaments..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TournamentStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="registration">Registration</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>
        
        {/* Tournaments list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-full text-center py-10">Loading tournaments...</p>
          ) : filteredTournaments.length > 0 ? (
            filteredTournaments.map((tournament) => (
              <Link href={`/tournaments/${tournament.id}`} key={tournament.id}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{tournament.title}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tournament.status === 'in_progress' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                          : tournament.status === 'draft'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                          : tournament.status === 'registration'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          : tournament.status === 'completed'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {tournament.status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </div>
                    <CardDescription className="mt-1">
                      {formatDate(tournament.start_date)} - {tournament.end_date ? formatDate(tournament.end_date) : 'TBD'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tournament.registration_deadline && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          Registration Deadline: {formatDate(tournament.registration_deadline)}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {tournament.categories?.length || 0} categories
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground mb-4">No tournaments found</p>
              <Link href="/tournaments/new">
                <Button>Create Tournament</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 