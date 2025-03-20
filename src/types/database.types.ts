// Database types for the application

// User roles in the system
export type UserRole = 'super_admin' | 'organizer' | 'player' | 'spectator';

// User type
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  nationality?: string;
  role: UserRole;
  created_at: string;
}

// Club type
export interface Club {
  id: string;
  name: string;
  logo_url?: string;
  organizer_ids: string[];
  location: string;
  number_of_courts: number;
  created_at: string;
}

// Tournament status types
export type TournamentStatus = 'draft' | 'active' | 'completed';

// Tournament format types
export type TournamentFormat = 'pool' | 'knockout' | 'league';

// Tournament type
export interface Tournament {
  id: string;
  club_id: string;
  name: string;
  start_date: string;
  end_date: string;
  logo_url?: string;
  banner_url?: string;
  registration_deadline: string;
  status: TournamentStatus;
  categories: any[];
  format?: any;
  created_at: string;
}

// Tournament category type
export interface TournamentCategory {
  id: string;
  tournament_id: string;
  name: string;
  gender: 'male' | 'female' | 'mixed' | 'open';
  skill_level: 'beginner' | 'intermediate' | 'upper_intermediate' | 'advanced';
  age_group?: string;
  format: TournamentFormat;
  tiebreaker_rules: any;
  created_at: string;
}

// Team type
export interface Team {
  id: string;
  player1_id: string;
  player2_id?: string;
  category_id: string;
  tournament_id: string;
  status: 'registered' | 'payment_pending' | 'confirmed' | 'withdrawn';
  created_at: string;
}

// Pool type
export interface Pool {
  id: string;
  category_id: string;
  name: string;
  teams: string[];
  created_at: string;
}

// Court type
export interface Court {
  id: string;
  club_id: string;
  name: string;
  status: 'available' | 'maintenance' | 'reserved';
  created_at: string;
}

// Match type
export interface Match {
  id: string;
  tournament_id: string;
  category_id: string;
  pool_id?: string;
  bracket_round?: string;
  team1_id: string;
  team2_id: string;
  court_id?: string;
  scheduled_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  scores?: any;
  winner_id?: string;
  created_at: string;
  updated_at: string;
}

// Payment type
export interface Payment {
  id: string;
  tournament_id: string;
  team_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  xendit_reference?: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      clubs: {
        Row: Club;
        Insert: Omit<Club, 'id' | 'created_at'>;
        Update: Partial<Omit<Club, 'id' | 'created_at'>>;
      };
      tournaments: {
        Row: Tournament;
        Insert: Omit<Tournament, 'id' | 'created_at'>;
        Update: Partial<Omit<Tournament, 'id' | 'created_at'>>;
      };
      categories: {
        Row: TournamentCategory;
        Insert: Omit<TournamentCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<TournamentCategory, 'id' | 'created_at'>>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, 'id' | 'created_at'>;
        Update: Partial<Omit<Team, 'id' | 'created_at'>>;
      };
      pools: {
        Row: Pool;
        Insert: Omit<Pool, 'id' | 'created_at'>;
        Update: Partial<Omit<Pool, 'id' | 'created_at'>>;
      };
      courts: {
        Row: Court;
        Insert: Omit<Court, 'id' | 'created_at'>;
        Update: Partial<Omit<Court, 'id' | 'created_at'>>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Match, 'id' | 'created_at' | 'updated_at'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at'>;
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>;
      };
    };
  };
} 