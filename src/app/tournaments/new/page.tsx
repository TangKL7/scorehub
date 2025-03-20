'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TournamentStatus, TournamentFormat } from '@/types/database.types';

const tournamentSchema = z.object({
  title: z.string().min(3, 'Tournament name is required'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  location: z.string().optional(),
  format: z.enum(['single_elimination', 'double_elimination', 'round_robin', 'league']),
  status: z.enum(['draft', 'registration', 'in_progress', 'completed', 'cancelled']),
  max_participants: z.number().optional(),
  registration_deadline: z.string().min(1, 'Registration deadline is required'),
});

type TournamentFormValues = z.infer<typeof tournamentSchema>;

export default function CreateTournamentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      location: '',
      format: 'single_elimination',
      status: 'draft',
      max_participants: undefined,
      registration_deadline: '',
    }
  });

  const onSubmit = async (data: TournamentFormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: newTournament, error } = await supabase
        .from('tournaments')
        .insert([
          {
            ...data,
            organizer_id: user.id,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      router.push(`/tournaments/${newTournament.id}`);
    } catch (error) {
      console.error('Error creating tournament:', error);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Tournament</h1>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tournament Details</CardTitle>
              <CardDescription>
                Basic information about your tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Tournament Name
                </label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Summer Open 2025"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="description"
                  {...register('description')}
                  placeholder="Tournament description"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Tournament location"
                />
                {errors.location && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.location.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="start_date" className="text-sm font-medium">
                    Start Date
                  </label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register('start_date')}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.start_date.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="end_date" className="text-sm font-medium">
                    End Date
                  </label>
                  <Input
                    id="end_date"
                    type="date"
                    {...register('end_date')}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.end_date.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="registration_deadline" className="text-sm font-medium">
                    Registration Deadline
                  </label>
                  <Input
                    id="registration_deadline"
                    type="date"
                    {...register('registration_deadline')}
                  />
                  {errors.registration_deadline && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.registration_deadline.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="format" className="text-sm font-medium">
                    Tournament Format
                  </label>
                  <select
                    id="format"
                    {...register('format')}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="single_elimination">Single Elimination</option>
                    <option value="double_elimination">Double Elimination</option>
                    <option value="round_robin">Round Robin</option>
                    <option value="league">League</option>
                  </select>
                  {errors.format && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.format.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="max_participants" className="text-sm font-medium">
                    Maximum Participants
                  </label>
                  <Input
                    id="max_participants"
                    type="number"
                    {...register('max_participants', { valueAsNumber: true })}
                    placeholder="Optional"
                  />
                  {errors.max_participants && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.max_participants.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="draft">Draft</option>
                  <option value="registration">Registration Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardFooter className="flex justify-between pt-6">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Tournament'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
} 