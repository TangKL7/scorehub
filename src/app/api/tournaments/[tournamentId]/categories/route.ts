import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TournamentCategory } from '@/types/database.types';

export async function GET(
  request: Request,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const { tournamentId } = params;
    
    // Check if tournament exists
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, status')
      .eq('id', tournamentId)
      .single();
    
    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    
    // Fetch categories for tournament
    const { data, error } = await supabase
      .from('tournament_categories')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('name');
    
    if (error) {
      console.error('Error fetching tournament categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/tournaments/[tournamentId]/categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const { tournamentId } = params;
    const body = await request.json();
    
    // Check if tournament exists and is not completed
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, status')
      .eq('id', tournamentId)
      .single();
    
    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    if (tournament.status === 'completed') {
      return NextResponse.json({ error: 'Cannot add categories to a completed tournament' }, { status: 400 });
    }
    
    // Validate required fields
    const requiredFields = ['name', 'gender', 'skill_level', 'format'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }
    
    // Validate gender
    const validGenders = ['male', 'female', 'mixed', 'open'];
    if (!validGenders.includes(body.gender)) {
      return NextResponse.json({ error: 'Invalid gender value' }, { status: 400 });
    }
    
    // Validate skill level
    const validSkillLevels = ['beginner', 'intermediate', 'upper_intermediate', 'advanced'];
    if (!validSkillLevels.includes(body.skill_level)) {
      return NextResponse.json({ error: 'Invalid skill level value' }, { status: 400 });
    }
    
    // Validate format
    const validFormats = ['pool', 'knockout', 'league'];
    if (!validFormats.includes(body.format)) {
      return NextResponse.json({ error: 'Invalid format value' }, { status: 400 });
    }

    // Validate age group if provided
    if (body.age_group) {
      const validAgeGroups = ['u12', 'u14', 'u16', 'u18', 'u21', 'open'];
      if (!validAgeGroups.includes(body.age_group)) {
        return NextResponse.json({ error: 'Invalid age group value' }, { status: 400 });
      }
    }
    
    // Insert category
    const { data, error } = await supabase
      .from('tournament_categories')
      .insert({
        tournament_id: tournamentId,
        name: body.name,
        gender: body.gender,
        skill_level: body.skill_level,
        age_group: body.age_group,
        format: body.format,
        tiebreaker_rules: body.tiebreaker_rules || ['matches_won', 'sets_won', 'games_won', 'direct_confrontation']
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating tournament category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/tournaments/[tournamentId]/categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 