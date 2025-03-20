import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Match } from '@/types/database.types';

export async function GET(
  request: Request,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const { tournamentId } = params;
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const categoryId = searchParams.get('category_id');
    const poolId = searchParams.get('pool_id');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const courtId = searchParams.get('court_id');
    
    // Check if tournament exists
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, status')
      .eq('id', tournamentId)
      .single();
    
    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    
    // Build query with filters
    let query = supabase
      .from('matches')
      .select(`
        *,
        team1:teams!team1_id(
          id, 
          player1:users!player1_id(id, name),
          player2:users!player2_id(id, name)
        ),
        team2:teams!team2_id(
          id, 
          player1:users!player1_id(id, name),
          player2:users!player2_id(id, name)
        ),
        category:tournament_categories(id, name),
        court:courts(id, name)
      `)
      .eq('tournament_id', tournamentId)
      .order('scheduled_time', { ascending: true });
    
    // Apply filters if provided
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (poolId) {
      query = query.eq('pool_id', poolId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (courtId) {
      query = query.eq('court_id', courtId);
    }
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query = query.gte('scheduled_time', startDate.toISOString())
              .lte('scheduled_time', endDate.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tournament matches:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/tournaments/[tournamentId]/matches:', error);
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
    
    // Validate required fields
    const requiredFields = ['team1_id', 'team2_id', 'scheduled_time', 'duration_minutes'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }
    
    // Check if teams are different
    if (body.team1_id === body.team2_id) {
      return NextResponse.json({ error: 'Team 1 and Team 2 cannot be the same' }, { status: 400 });
    }
    
    // Verify teams belong to the tournament and the same category
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, category_id, status')
      .in('id', [body.team1_id, body.team2_id])
      .eq('tournament_id', tournamentId);
    
    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return NextResponse.json({ error: teamsError.message }, { status: 500 });
    }
    
    if (!teams || teams.length !== 2) {
      return NextResponse.json({ error: 'One or both teams not found in this tournament' }, { status: 400 });
    }

    // Check if teams are active
    if (teams.some(team => team.status !== 'confirmed')) {
      return NextResponse.json({ error: 'Both teams must be confirmed to schedule a match' }, { status: 400 });
    }
    
    // Check if teams are in the same category
    if (teams[0].category_id !== teams[1].category_id) {
      return NextResponse.json({ error: 'Teams must be in the same category' }, { status: 400 });
    }
    
    // Check for scheduling conflicts
    const scheduledTime = new Date(body.scheduled_time);
    const endTime = new Date(scheduledTime.getTime() + body.duration_minutes * 60000);
    
    // Check court availability
    if (body.court_id) {
      const { data: courtConflicts, error: courtError } = await supabase
        .from('matches')
        .select('id, scheduled_time, duration_minutes')
        .eq('court_id', body.court_id)
        .neq('status', 'completed')
        .or(`scheduled_time.lte.${endTime.toISOString()},scheduled_time.gte.${scheduledTime.toISOString()}`);
      
      if (courtError) {
        console.error('Error checking court conflicts:', courtError);
        return NextResponse.json({ error: courtError.message }, { status: 500 });
      }
      
      if (courtConflicts && courtConflicts.length > 0) {
        // Check if any of the conflicts actually overlap
        const hasOverlap = courtConflicts.some(match => {
          const matchStart = new Date(match.scheduled_time);
          const matchEnd = new Date(matchStart.getTime() + match.duration_minutes * 60000);
          
          return (
            (scheduledTime >= matchStart && scheduledTime < matchEnd) ||
            (endTime > matchStart && endTime <= matchEnd) ||
            (scheduledTime <= matchStart && endTime >= matchEnd)
          );
        });
        
        if (hasOverlap) {
          return NextResponse.json({ error: 'Court is already booked during this time' }, { status: 400 });
        }
      }
    }
    
    // Check team availability (players shouldn't be in multiple matches at the same time)
    const { data: teamConflicts, error: teamError } = await supabase
      .from('matches')
      .select('id, scheduled_time, duration_minutes, team1_id, team2_id')
      .neq('status', 'completed')
      .or(`team1_id.eq.${body.team1_id},team1_id.eq.${body.team2_id},team2_id.eq.${body.team1_id},team2_id.eq.${body.team2_id}`)
      .or(`scheduled_time.lte.${endTime.toISOString()},scheduled_time.gte.${scheduledTime.toISOString()}`);
    
    if (teamError) {
      console.error('Error checking team conflicts:', teamError);
      return NextResponse.json({ error: teamError.message }, { status: 500 });
    }
    
    if (teamConflicts && teamConflicts.length > 0) {
      // Check if any of the conflicts actually overlap
      const hasOverlap = teamConflicts.some(match => {
        const matchStart = new Date(match.scheduled_time);
        const matchEnd = new Date(matchStart.getTime() + match.duration_minutes * 60000);
        
        return (
          (scheduledTime >= matchStart && scheduledTime < matchEnd) ||
          (endTime > matchStart && endTime <= matchEnd) ||
          (scheduledTime <= matchStart && endTime >= matchEnd)
        );
      });
      
      if (hasOverlap) {
        return NextResponse.json({ error: 'One or both teams already have a match scheduled during this time' }, { status: 400 });
      }
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid match status' }, { status: 400 });
      }
    }
    
    // Create match
    const { data, error } = await supabase
      .from('matches')
      .insert({
        tournament_id: tournamentId,
        category_id: teams[0].category_id,
        pool_id: body.pool_id,
        bracket_round: body.bracket_round,
        team1_id: body.team1_id,
        team2_id: body.team2_id,
        court_id: body.court_id,
        scheduled_time: body.scheduled_time,
        duration_minutes: body.duration_minutes,
        status: body.status || 'scheduled',
        scores: body.scores
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating match:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/tournaments/[tournamentId]/matches:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 