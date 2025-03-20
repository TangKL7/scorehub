'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Team, TournamentCategory } from '@/types/database.types';
import { Search, PlusCircle, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface TeamsListProps {
  tournamentId: string;
}

export default function TeamsList({ tournamentId }: TeamsListProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [categories, setCategories] = useState<TournamentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId);
        
      if (teamsError) throw teamsError;
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('tournament_categories')
        .select('*')
        .eq('tournament_id', tournamentId);
        
      if (categoriesError) throw categoriesError;
      
      setTeams(teamsData || []);
      setCategories(categoriesData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teams data:', error);
      setLoading(false);
    }
  };

  const getFilteredTeams = () => {
    return teams.filter((team) => {
      // Apply category filter
      if (categoryFilter !== 'all' && team.category_id !== categoryFilter) {
        return false;
      }
      
      // Apply search filter (in a real app, we would search player names)
      if (searchQuery && !team.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'payment_pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'withdrawn':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  if (loading) {
    return <div className="text-center py-4">Loading teams...</div>;
  }

  const filteredTeams = getFilteredTeams();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teams</h2>
        <div className="flex space-x-2">
          <Link href={`/tournaments/${tournamentId}/teams/import`}>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Teams
            </Button>
          </Link>
          <Link href={`/tournaments/${tournamentId}/teams/new`}>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams or players..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Teams list */}
      {teams.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">Team</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team) => (
                    <tr key={team.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {team.player1_id}
                          {team.player2_id && ` · ${team.player2_id}`}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getCategoryName(team.category_id)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {getStatusIcon(team.status)}
                          <span className="ml-2 text-sm capitalize">{team.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Link href={`/tournaments/${tournamentId}/teams/${team.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Link href={`/tournaments/${tournamentId}/teams/${team.id}/edit`}>
                            <Button variant="outline" size="sm">Edit</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No teams registered yet</p>
            <div className="space-x-2">
              <Link href={`/tournaments/${tournamentId}/teams/invite`}>
                <Button variant="outline">Send Invitations</Button>
              </Link>
              <Link href={`/tournaments/${tournamentId}/teams/new`}>
                <Button>Add Team Manually</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 