'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tournament, Match, Team, TournamentCategory } from '@/types/database.types';
import { BarChart, PieChart, Users, Trophy } from 'lucide-react';

interface TournamentStatsProps {
  tournamentId: string;
}

interface TournamentStats {
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  categoryCounts: Record<string, number>;
  matchesPerDay: Record<string, number>;
}

export default function TournamentStats({ tournamentId }: TournamentStatsProps) {
  const [stats, setStats] = useState<TournamentStats>({
    totalTeams: 0,
    totalMatches: 0,
    completedMatches: 0,
    categoryCounts: {},
    matchesPerDay: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatsData();
  }, [tournamentId]);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId);
        
      if (teamsError) throw teamsError;
      
      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId);
        
      if (matchesError) throw matchesError;
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('tournament_categories')
        .select('*')
        .eq('tournament_id', tournamentId);
        
      if (categoriesError) throw categoriesError;
      
      // Calculate statistics
      const teams = teamsData || [];
      const matches = matchesData || [];
      const categories = categoriesData || [];
      
      // Teams per category
      const categoryCounts: Record<string, number> = {};
      categories.forEach((category) => {
        const categoryTeams = teams.filter((team) => team.category_id === category.id);
        categoryCounts[category.name] = categoryTeams.length;
      });
      
      // Matches per day
      const matchesPerDay: Record<string, number> = {};
      matches.forEach((match) => {
        const dateStr = new Date(match.scheduled_time).toISOString().split('T')[0];
        matchesPerDay[dateStr] = (matchesPerDay[dateStr] || 0) + 1;
      });
      
      setStats({
        totalTeams: teams.length,
        totalMatches: matches.length,
        completedMatches: matches.filter((match) => match.status === 'completed').length,
        categoryCounts,
        matchesPerDay,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading tournament statistics...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Tournament Statistics</h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Teams
              </p>
              <h3 className="text-2xl font-bold">{stats.totalTeams}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Matches
              </p>
              <h3 className="text-2xl font-bold">{stats.totalMatches}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed Matches
              </p>
              <h3 className="text-2xl font-bold">{stats.completedMatches}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <PieChart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </p>
              <h3 className="text-2xl font-bold">
                {stats.totalMatches ? Math.round((stats.completedMatches / stats.totalMatches) * 100) : 0}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Teams by Category</CardTitle>
            <CardDescription>
              Distribution of teams across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.categoryCounts).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.categoryCounts).map(([category, count]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(stats.categoryCounts))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No teams registered yet
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Matches by Day</CardTitle>
            <CardDescription>
              Distribution of matches across tournament days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.matchesPerDay).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.matchesPerDay).map(([day, count]) => (
                  <div key={day} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{new Date(day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(stats.matchesPerDay))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No matches scheduled yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 