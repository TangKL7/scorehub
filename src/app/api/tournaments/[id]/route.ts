import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Tournament, TournamentStatus } from '@/types/database.types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch tournament with related data
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        tournament_categories(*),
        club:clubs(id, name, logo_url, location, number_of_courts)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 is the error code for "No rows returned"
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      }
      console.error('Error fetching tournament:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/tournaments/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Check if tournament exists
    const { data: existingTournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('id, status')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingTournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Prevent updating completed tournaments
    if (existingTournament.status === 'completed') {
      return NextResponse.json({ error: 'Cannot update a completed tournament' }, { status: 400 });
    }
    
    // Validate dates if provided
    if (body.start_date && body.end_date) {
      const startDate = new Date(body.start_date);
      const endDate = new Date(body.end_date);
      
      if (endDate < startDate) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
      }
    }
    
    if (body.start_date && body.registration_deadline) {
      const startDate = new Date(body.start_date);
      const regDeadline = new Date(body.registration_deadline);
      
      if (regDeadline > startDate) {
        return NextResponse.json({ error: 'Registration deadline must be before start date' }, { status: 400 });
      }
    }

    // Validate status if provided
    if (body.status && !['draft', 'active', 'completed'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid tournament status' }, { status: 400 });
    }
    
    // Update tournament
    const { data, error } = await supabase
      .from('tournaments')
      .update({
        name: body.name,
        start_date: body.start_date,
        end_date: body.end_date,
        registration_deadline: body.registration_deadline,
        status: body.status,
        logo_url: body.logo_url,
        banner_url: body.banner_url,
        categories: body.categories,
        format: body.format
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating tournament:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error in PATCH /api/tournaments/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if tournament exists and is not completed
    const { data: existingTournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('id, status')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingTournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Prevent deleting completed tournaments
    if (existingTournament.status === 'completed') {
      return NextResponse.json({ error: 'Cannot delete a completed tournament' }, { status: 400 });
    }
    
    // Delete tournament
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting tournament:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/tournaments/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 