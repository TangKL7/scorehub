'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TournamentCategory } from '@/types/database.types';
import { PlusCircle } from 'lucide-react';

interface CategoryListProps {
  tournamentId: string;
}

export default function CategoryList({ tournamentId }: CategoryListProps) {
  const [categories, setCategories] = useState<TournamentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [tournamentId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tournament_id', tournamentId);
        
      if (error) throw error;
      
      setCategories(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Link href={`/tournaments/${tournamentId}/categories/new`}>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>
                  {category.gender} · {category.skill_level}
                  {category.age_group && ` · ${category.age_group}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Format: {category.format}</p>
                    {/* In a real app, we would count teams here */}
                    <p className="text-sm text-muted-foreground">Teams: 0</p>
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
    </div>
  );
} 