// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Tables, DbResponse } from '../types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Tables>(supabaseUrl, supabaseAnonKey);

// Type-safe database functions
export async function getScores(): Promise<DbResponse<Tables['scores'][]>> {
  const { data, error } = await supabase.from('scores').select('*');
  return { data, error };
}

// Add more database functions as needed
export async function createScore(score: Omit<Tables['scores'], 'id' | 'created_at'>): Promise<DbResponse<Tables['scores']>> {
  const { data, error } = await supabase.from('scores').insert(score).select().single();
  return { data, error };
}

export async function updateScore(id: string, updates: Partial<Tables['scores']>): Promise<DbResponse<Tables['scores']>> {
  const { data, error } = await supabase.from('scores').update(updates).eq('id', id).select().single();
  return { data, error };
}

export async function deleteScore(id: string): Promise<DbResponse<Tables['scores']>> {
  const { data, error } = await supabase.from('scores').delete().eq('id', id).select().single();
  return { data, error };
}

