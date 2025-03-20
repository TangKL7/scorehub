'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { Tournament, TournamentCategory } from '@/types/database.types';
import { Calendar, Users, Medal, BarChart, Clock, MapPin } from 'lucide-react';

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<TournamentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const tournamentId = params.id;

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentData();
    }
  }, [tournamentId]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      
      // Fetch tournament details
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (tournamentError) throw tournamentError;
      
      // Fetch tournament categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('tournament_categories')
        .select('*')
        .eq('tournament_id', tournamentId);

      if (categoriesError) throw categoriesError;
      
      setTournament(tournamentData);
      setCategories(categoriesData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tournament data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading tournament data...</div>
      </DashboardLayout>
    );
  }

  if (!tournament) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Tournament not found</h2>
          <Link href="/tournaments">
            <Button>Back to Tournaments</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Tournament header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{tournament.title}</h1>
            <p className="text-muted-foreground mt-1">
              {formatDate(tournament.start_date)} - {tournament.end_date ? formatDate(tournament.end_date) : 'TBD'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
            
            <Link href={`/tournaments/${tournamentId}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
          </div>
        </div>
        
        {/* Tournament tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Overview</CardTitle>
                <CardDescription>
                  Key information about this tournament
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Tournament Dates</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(tournament.start_date)} - {tournament.end_date ? formatDate(tournament.end_date) : 'TBD'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Registration Deadline</p>
                        <p className="text-sm text-muted-foreground">
                          {tournament.registration_deadline ? formatDate(tournament.registration_deadline) : 'Not set'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {tournament.location || 'No location specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Medal className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Categories</p>
                        <p className="text-sm text-muted-foreground">
                          {categories.length} categories
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Maximum Participants</p>
                        <p className="text-sm text-muted-foreground">
                          {tournament.max_participants || 'Unlimited'} participants
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <BarChart className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Tournament Format</p>
                        <p className="text-sm text-muted-foreground">
                          {tournament.format.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Registration Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-3xl font-bold mb-2">0</p>
                    <p className="text-muted-foreground">teams registered</p>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('teams')}
                    >
                      View Teams
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href={`/tournaments/${tournamentId}/categories/new`}>
                      <Button variant="outline" className="w-full justify-start">
                        Add Category
                      </Button>
                    </Link>
                    <Link href={`/tournaments/${tournamentId}/teams/invite`}>
                      <Button variant="outline" className="w-full justify-start">
                        Invite Players
                      </Button>
                    </Link>
                    <Link href={`/tournaments/${tournamentId}/schedule`}>
                      <Button variant="outline" className="w-full justify-start">
                        Manage Schedule
                      </Button>
                    </Link>
                    <Link href={`/tournaments/${tournamentId}/public`} target="_blank">
                      <Button variant="outline" className="w-full justify-start">
                        View Public Page
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Link href={`/tournaments/${tournamentId}/categories/new`}>
                <Button>Add Category</Button>
              </Link>
            </div>
            
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>
                        {category.tournament_id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Created: {formatDate(category.created_at)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Teams: 0
                          </p>
                        </div>
                        <Link href={`/tournaments/${tournamentId}/categories/${category.id}`}>
                          <Button variant="outline" size="sm">Manage</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">No categories created yet</p>
                  <Link href={`/tournaments/${tournamentId}/categories/new`}>
                    <Button>Add First Category</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Teams</h2>
              <div className="space-x-2">
                <Link href={`/tournaments/${tournamentId}/teams/import`}>
                  <Button variant="outline">Import Teams</Button>
                </Link>
                <Link href={`/tournaments/${tournamentId}/teams/new`}>
                  <Button>Add Team</Button>
                </Link>
              </div>
            </div>
            
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
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Tournament Schedule</h2>
              <Link href={`/tournaments/${tournamentId}/schedule/manage`}>
                <Button>Manage Schedule</Button>
              </Link>
            </div>
            
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No matches scheduled yet</p>
                <p className="text-muted-foreground mb-4">Schedule matches once teams are registered and pools are created</p>
                <Link href={`/tournaments/${tournamentId}/schedule/manage`}>
                  <Button>Create Schedule</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 