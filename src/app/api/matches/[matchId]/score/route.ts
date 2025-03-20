import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Match } from '@/types/database.types';

export async function PATCH(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    const body = await request.json();
    
    // Validate scores
    if (!body.scores || !body.scores.team1 || !body.scores.team2) {
      return NextResponse.json({ error: 'Valid scores for both teams are required' }, { status: 400 });
    }
    
    if (!Array.isArray(body.scores.team1) || !Array.isArray(body.scores.team2)) {
      return NextResponse.json({ error: 'Scores must be arrays' }, { status: 400 });
    }
    
    if (body.scores.team1.length !== body.scores.team2.length) {
      return NextResponse.json({ error: 'Both teams must have the same number of sets' }, { status: 400 });
    }

    // Validate that scores are numbers
    if (body.scores.team1.some((score: unknown) => typeof score !== 'number') || 
        body.scores.team2.some((score: unknown) => typeof score !== 'number')) {
      return NextResponse.json({ error: 'All scores must be numbers' }, { status: 400 });
    }
    
    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*, tournament:tournaments(status)')
      .eq('id', matchId)
      .single();
    
    if (matchError) {
      if (matchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      }
      console.error('Error fetching match:', matchError);
      return NextResponse.json({ error: matchError.message }, { status: 500 });
    }

    // Validate match is in a valid state for score updating
    if (match.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot update scores for cancelled matches' }, { status: 400 });
    }

    // Check if tournament is still active
    if (match.tournament?.status === 'completed') {
      return NextResponse.json({ error: 'Cannot update scores for matches in completed tournaments' }, { status: 400 });
    }
    
    // Calculate winner based on sets won
    let team1SetsWon = 0;
    let team2SetsWon = 0;
    
    for (let i = 0; i < body.scores.team1.length; i++) {
      if (body.scores.team1[i] > body.scores.team2[i]) {
        team1SetsWon++;
      } else if (body.scores.team2[i] > body.scores.team1[i]) {
        team2SetsWon++;
      }
    }
    
    const winnerId = team1SetsWon > team2SetsWon ? match.team1_id : 
                     team2SetsWon > team1SetsWon ? match.team2_id : null;

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid match status' }, { status: 400 });
      }
    }
    
    // Update match with score and winner
    const { data, error } = await supabase
      .from('matches')
      .update({
        scores: body.scores,
        winner_id: winnerId,
        status: body.status || (winnerId ? 'completed' : match.status)
      })
      .eq('id', matchId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating match score:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // If match is now completed, update tournament standings
    if (data.status === 'completed' && winnerId) {
      // Update pool standings or bracket progression (async, don't await)
      updateMatchResults(matchId, winnerId).catch(err => {
        console.error('Error updating match results:', err);
      });
    }
    
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error in PATCH /api/matches/[matchId]/score:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function updateMatchResults(matchId: string, winnerId: string) {
  try {
    // Get full match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        pool:pools(id, standings),
        category:tournament_categories(id, format)
      `)
      .eq('id', matchId)
      .single();
    
    if (matchError || !match) {
      console.error('Error fetching match details for standings update:', matchError);
      return;
    }
    
    // If match is part of a pool, update pool standings
    if (match.pool_id && match.pool) {
      let standings = match.pool.standings || {};
      
      // Initialize standings if they don't exist for either team
      if (!standings[match.team1_id]) {
        standings[match.team1_id] = {
          matches_played: 0,
          matches_won: 0,
          sets_won: 0,
          sets_lost: 0,
          points_won: 0,
          points_lost: 0
        };
      }
      
      if (!standings[match.team2_id]) {
        standings[match.team2_id] = {
          matches_played: 0,
          matches_won: 0,
          sets_won: 0,
          sets_lost: 0,
          points_won: 0,
          points_lost: 0
        };
      }
      
      // Count sets and points
      let team1SetsWon = 0;
      let team2SetsWon = 0;
      let team1PointsWon = 0;
      let team2PointsWon = 0;
      
      if (match.scores && match.scores.team1 && match.scores.team2) {
        for (let i = 0; i < match.scores.team1.length; i++) {
          if (match.scores.team1[i] > match.scores.team2[i]) {
            team1SetsWon++;
          } else if (match.scores.team2[i] > match.scores.team1[i]) {
            team2SetsWon++;
          }
          
          team1PointsWon += match.scores.team1[i] || 0;
          team2PointsWon += match.scores.team2[i] || 0;
        }
      }
      
      // Update team 1's statistics
      standings[match.team1_id].matches_played++;
      standings[match.team1_id].sets_won += team1SetsWon;
      standings[match.team1_id].sets_lost += team2SetsWon;
      standings[match.team1_id].points_won += team1PointsWon;
      standings[match.team1_id].points_lost += team2PointsWon;
      
      // Update team 2's statistics
      standings[match.team2_id].matches_played++;
      standings[match.team2_id].sets_won += team2SetsWon;
      standings[match.team2_id].sets_lost += team1SetsWon;
      standings[match.team2_id].points_won += team2PointsWon;
      standings[match.team2_id].points_lost += team1PointsWon;
      
      // Update match wins
      if (winnerId === match.team1_id) {
        standings[match.team1_id].matches_won++;
      } else if (winnerId === match.team2_id) {
        standings[match.team2_id].matches_won++;
      }
      
      // Update pool standings in database
      await supabase
        .from('pools')
        .update({ standings })
        .eq('id', match.pool_id);
    }
    
    // If match is part of a knockout bracket, create next round match if needed
    // (This would be implemented based on your bracket structure)
    
  } catch (error) {
    console.error('Error in updateMatchResults:', error);
  }
} 