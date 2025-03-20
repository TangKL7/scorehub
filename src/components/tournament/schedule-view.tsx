'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Match, Court } from '@/types/database.types';
import { formatDate } from '@/lib/utils';
import { CalendarDays, Clock } from 'lucide-react';

interface ScheduleViewProps {
  tournamentId: string;
}

export default function ScheduleView({ tournamentId }: ScheduleViewProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    fetchScheduleData();
  }, [tournamentId]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      
      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('scheduled_time', { ascending: true });
        
      if (matchesError) throw matchesError;
      
      // Fetch courts
      const { data: courtsData, error: courtsError } = await supabase
        .from('courts')
        .select('*')
        .eq('club_id', 'club1'); // In a real app, we would get the club_id from the tournament
        
      if (courtsError) throw courtsError;
      
      setMatches(matchesData || []);
      setCourts(courtsData || []);
      
      // Extract unique dates from matches
      if (matchesData && matchesData.length > 0) {
        const dates = Array.from(new Set(
          matchesData.map((match) => {
            const date = new Date(match.scheduled_time);
            return date.toISOString().split('T')[0];
          })
        ));
        setAvailableDates(dates);
        setSelectedDate(dates[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      setLoading(false);
    }
  };

  const getMatchesByDate = () => {
    if (!selectedDate) return [];
    
    return matches.filter((match) => {
      const matchDate = new Date(match.scheduled_time).toISOString().split('T')[0];
      return matchDate === selectedDate;
    });
  };

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="text-center py-4">Loading schedule...</div>;
  }

  const filteredMatches = getMatchesByDate();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tournament Schedule</h2>
        <Link href={`/tournaments/${tournamentId}/schedule/manage`}>
          <Button>Manage Schedule</Button>
        </Link>
      </div>

      {matches.length > 0 ? (
        <>
          {/* Date selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {availableDates.map((date) => (
                  <Button
                    key={date}
                    variant={date === selectedDate ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDate(date)}
                  >
                    {formatDate(date)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courts.map((court) => (
              <Card key={court.id}>
                <CardHeader className="pb-2">
                  <CardTitle>{court.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredMatches
                      .filter((match) => match.court_id === court.id)
                      .map((match) => (
                        <div
                          key={match.id}
                          className="p-3 rounded-md border bg-muted/30"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-medium">
                              {match.team1_id} vs {match.team2_id}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {match.status}
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatMatchTime(match.scheduled_time)}
                            <span className="mx-1">·</span>
                            {match.duration_minutes} min
                          </div>
                        </div>
                      ))}
                    
                    {filteredMatches.filter((match) => match.court_id === court.id).length === 0 && (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No matches scheduled for this court
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No matches scheduled yet</p>
            <Link href={`/tournaments/${tournamentId}/schedule/manage`}>
              <Button>Create Schedule</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 