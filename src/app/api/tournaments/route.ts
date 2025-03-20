import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Tournament, TournamentStatus } from '@/types/database.types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('club_id');
    const status = searchParams.get('status') as TournamentStatus | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query with filters
    let query = supabase
      .from('tournaments')
      .select('*, tournament_categories(*), club:clubs(id, name, logo_url)')
      .order('start_date', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (clubId) {
      query = query.eq('club_id', clubId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching tournaments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data, 
      meta: { 
        total: count, 
        limit, 
        offset 
      } 
    });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/tournaments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'club_id', 'start_date', 'end_date', 'registration_deadline'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Validate dates
    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);
    const regDeadline = new Date(body.registration_deadline);

    if (endDate < startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    if (regDeadline > startDate) {
      return NextResponse.json({ error: 'Registration deadline must be before start date' }, { status: 400 });
    }

    // Validate status if provided
    if (body.status && !['draft', 'active', 'completed'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid tournament status' }, { status: 400 });
    }

    // Insert tournament
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name: body.name,
        club_id: body.club_id,
        start_date: body.start_date,
        end_date: body.end_date,
        registration_deadline: body.registration_deadline,
        status: body.status || 'draft',
        logo_url: body.logo_url,
        banner_url: body.banner_url,
        categories: body.categories || [],
        format: body.format || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tournament:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/tournaments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 