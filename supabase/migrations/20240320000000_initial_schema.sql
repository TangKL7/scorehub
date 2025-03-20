-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  nationality VARCHAR,
  role VARCHAR NOT NULL CHECK (role IN ('super_admin', 'organizer', 'player', 'spectator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clubs table
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  logo_url VARCHAR,
  organizer_ids UUID[] NOT NULL,
  location VARCHAR NOT NULL,
  number_of_courts INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  name VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  logo_url VARCHAR,
  banner_url VARCHAR,
  registration_deadline DATE NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('draft', 'active', 'completed')),
  categories JSONB DEFAULT '[]',
  format JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_dates CHECK (end_date >= start_date AND registration_deadline <= start_date)
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  gender VARCHAR NOT NULL CHECK (gender IN ('male', 'female', 'mixed', 'open')),
  skill_level VARCHAR NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'upper_intermediate', 'advanced')),
  age_group VARCHAR,
  format VARCHAR NOT NULL CHECK (format IN ('pool', 'knockout', 'league')),
  tiebreaker_rules JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player1_id UUID NOT NULL REFERENCES users(id),
  player2_id UUID REFERENCES users(id),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL CHECK (status IN ('registered', 'payment_pending', 'confirmed', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pools table
CREATE TABLE pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  teams UUID[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courts table
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('available', 'maintenance', 'reserved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  pool_id UUID REFERENCES pools(id) ON DELETE SET NULL,
  bracket_round VARCHAR,
  team1_id UUID NOT NULL REFERENCES teams(id),
  team2_id UUID NOT NULL REFERENCES teams(id),
  court_id UUID REFERENCES courts(id),
  scheduled_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  scores JSONB,
  winner_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT different_teams CHECK (team1_id != team2_id)
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  xendit_reference VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create RLS policies for each table

-- Users RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Clubs RLS
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read clubs" ON clubs
  FOR SELECT USING (true);

CREATE POLICY "Organizers can create clubs" ON clubs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'organizer'))
  );

CREATE POLICY "Club organizers can update their clubs" ON clubs
  FOR UPDATE USING (
    auth.uid() = ANY(organizer_ids) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Tournaments RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournaments" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "Club organizers can create tournaments" ON tournaments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clubs
      WHERE id = club_id AND auth.uid() = ANY(organizer_ids)
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Tournament organizers can update tournaments" ON tournaments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clubs
      WHERE id = club_id AND auth.uid() = ANY(organizer_ids)
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Categories RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Tournament organizers can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tournaments t
      JOIN clubs c ON t.club_id = c.id
      WHERE t.id = tournament_id AND auth.uid() = ANY(c.organizer_ids)
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Teams RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Players can register themselves" ON teams
  FOR INSERT WITH CHECK (
    auth.uid() = player1_id OR auth.uid() = player2_id
  );

CREATE POLICY "Tournament organizers can manage teams" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tournaments t
      JOIN clubs c ON t.club_id = c.id
      WHERE t.id = tournament_id AND auth.uid() = ANY(c.organizer_ids)
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Pools RLS
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pools" ON pools
  FOR SELECT USING (true);

CREATE POLICY "Tournament organizers can manage pools" ON pools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM categories cat
      JOIN tournaments t ON cat.tournament_id = t.id
      JOIN clubs c ON t.club_id = c.id
      WHERE cat.id = category_id AND auth.uid() = ANY(c.organizer_ids)
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Courts RLS
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read courts" ON courts
  FOR SELECT USING (true);

CREATE POLICY "Club organizers can manage courts" ON courts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clubs
      WHERE id = club_id AND auth.uid() = ANY(organizer_ids)
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Matches RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Tournament organizers can manage matches" ON matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tournaments t
      JOIN clubs c ON t.club_id = c.id
      WHERE t.id = tournament_id AND auth.uid() = ANY(c.organizer_ids)
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Payments RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE id = team_id AND (player1_id = auth.uid() OR player2_id = auth.uid())
    )
  );

CREATE POLICY "Tournament organizers can read payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tournaments t
      JOIN clubs c ON t.club_id = c.id
      WHERE t.id = tournament_id AND auth.uid() = ANY(c.organizer_ids)
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Tournament organizers can manage payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tournaments t
      JOIN clubs c ON t.club_id = c.id
      WHERE t.id = tournament_id AND auth.uid() = ANY(c.organizer_ids)
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to matches table for updated_at
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create indexes for performance
CREATE INDEX idx_tournaments_club_id ON tournaments(club_id);
CREATE INDEX idx_categories_tournament_id ON categories(tournament_id);
CREATE INDEX idx_teams_tournament_id ON teams(tournament_id);
CREATE INDEX idx_teams_category_id ON teams(category_id);
CREATE INDEX idx_pools_category_id ON pools(category_id);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_category_id ON matches(category_id);
CREATE INDEX idx_matches_pool_id ON matches(pool_id);
CREATE INDEX idx_matches_scheduled_time ON matches(scheduled_time);
CREATE INDEX idx_courts_club_id ON courts(club_id);
CREATE INDEX idx_payments_tournament_id ON payments(tournament_id);
CREATE INDEX idx_payments_team_id ON payments(team_id); 