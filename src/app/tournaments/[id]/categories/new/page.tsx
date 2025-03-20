'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const categorySchema = z.object({
  name: z.string().min(3, 'Category name is required'),
  description: z.string().optional(),
  gender: z.enum(['men', 'women', 'mixed']),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'professional']),
  min_teams: z.number().min(2, 'Minimum 2 teams required').optional(),
  max_teams: z.number().min(2, 'Minimum 2 teams required').optional(),
  format: z.enum(['single_elimination', 'double_elimination', 'round_robin', 'league']).optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function NewCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const tournamentId = params.id;

  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      gender: 'mixed',
      skill_level: 'intermediate',
      min_teams: 2,
      max_teams: undefined,
      format: 'single_elimination'
    }
  });

  const onSubmit = async (data: CategoryFormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: newCategory, error } = await supabase
        .from('tournament_categories')
        .insert([
          {
            ...data,
            tournament_id: tournamentId,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      router.push(`/tournaments/${tournamentId}`);
    } catch (error) {
      console.error('Error creating category:', error);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Category</h1>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Define the parameters for this tournament category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Category Name
                </label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Men's Open"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </label>
                <Input
                  id="description"
                  {...register('description')}
                  placeholder="Category description"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </label>
                  <select
                    id="gender"
                    {...register('gender')}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="mixed">Mixed</option>
                  </select>
                  {errors.gender && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.gender.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="skill_level" className="text-sm font-medium">
                    Skill Level
                  </label>
                  <select
                    id="skill_level"
                    {...register('skill_level')}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="professional">Professional</option>
                  </select>
                  {errors.skill_level && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.skill_level.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="min_teams" className="text-sm font-medium">
                    Minimum Teams
                  </label>
                  <Input
                    id="min_teams"
                    type="number"
                    min={2}
                    {...register('min_teams', { valueAsNumber: true })}
                  />
                  {errors.min_teams && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.min_teams.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="max_teams" className="text-sm font-medium">
                    Maximum Teams (Optional)
                  </label>
                  <Input
                    id="max_teams"
                    type="number"
                    min={2}
                    {...register('max_teams', { valueAsNumber: true })}
                    placeholder="No limit"
                  />
                  {errors.max_teams && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.max_teams.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="format" className="text-sm font-medium">
                  Competition Format
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
            </CardContent>
          </Card>
          
          <Card>
            <CardFooter className="flex justify-between pt-6">
              <Link href={`/tournaments/${tournamentId}`}>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Category'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
} 