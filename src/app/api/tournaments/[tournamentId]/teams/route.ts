import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Team } from '@/types/database.types';

export async function GET(
  request: Request,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const { tournamentId } = params;
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');
    
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
      .from('teams')
      .select(`
        *,
        player1:users!player1_id(id, name, email, phone, nationality),
        player2:users!player2_id(id, name, email, phone, nationality),
        category:tournament_categories(id, name, gender, skill_level)
      `)
      .eq('tournament_id', tournamentId);
    
    // Apply additional filters if provided
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tournament teams:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/tournaments/[tournamentId]/teams:', error);
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
    const requiredFields = ['player1_id', 'category_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }
    
    // Check if tournament exists
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('registration_deadline, status')
      .eq('id', tournamentId)
      .single();
    
    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    
    // Check if registration is still open
    const today = new Date();
    const registrationDeadline = new Date(tournament.registration_deadline);
    
    if (today > registrationDeadline) {
      return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 });
    }
    
    if (tournament.status !== 'draft' && tournament.status !== 'active') {
      return NextResponse.json({ error: 'Tournament is not open for registration' }, { status: 400 });
    }
    
    // Check if category exists and belongs to the tournament
    const { data: category, error: categoryError } = await supabase
      .from('tournament_categories')
      .select('id')
      .eq('id', body.category_id)
      .eq('tournament_id', tournamentId)
      .single();
    
    if (categoryError || !category) {
      return NextResponse.json({ error: 'Category not found or does not belong to this tournament' }, { status: 400 });
    }
    
    // Check if players already registered in the same category
    const { data: existingTeam, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('category_id', body.category_id)
      .or(`player1_id.eq.${body.player1_id},player2_id.eq.${body.player1_id}${body.player2_id ? `,player1_id.eq.${body.player2_id},player2_id.eq.${body.player2_id}` : ''}`);
    
    if (existingTeam && existingTeam.length > 0) {
      return NextResponse.json({ error: 'One or both players are already registered in this category' }, { status: 400 });
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['registered', 'confirmed', 'payment_pending', 'withdrawn'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid team status' }, { status: 400 });
      }
    }
    
    // Insert team
    const { data, error } = await supabase
      .from('teams')
      .insert({
        tournament_id: tournamentId,
        category_id: body.category_id,
        player1_id: body.player1_id,
        player2_id: body.player2_id,
        status: body.status || 'registered'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating team:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/tournaments/[tournamentId]/teams:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 