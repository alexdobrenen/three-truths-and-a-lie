import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase') || supabaseAnonKey.includes('your_supabase')) {
  console.error('⚠️  Supabase is not configured. Please update your .env file with valid credentials.');
  console.error('See SETUP.md for instructions on setting up Supabase.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          status: 'lobby' | 'playing' | 'completed';
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          status?: 'lobby' | 'playing' | 'completed';
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          status?: 'lobby' | 'playing' | 'completed';
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
      };
      game_participants: {
        Row: {
          id: string;
          game_session_id: string;
          player_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          game_session_id: string;
          player_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          game_session_id?: string;
          player_id?: string;
          joined_at?: string;
        };
      };
      game_rounds: {
        Row: {
          id: string;
          game_session_id: string;
          round_number: number;
          true_article_1: string;
          true_article_1_url: string;
          true_article_2: string;
          true_article_2_url: string;
          true_article_3: string;
          true_article_3_url: string;
          lie_article: string;
          correct_answer: number;
          started_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          game_session_id: string;
          round_number: number;
          true_article_1: string;
          true_article_1_url: string;
          true_article_2: string;
          true_article_2_url: string;
          true_article_3: string;
          true_article_3_url: string;
          lie_article: string;
          correct_answer: number;
          started_at?: string;
          ended_at?: string | null;
        };
        Update: {
          id?: string;
          game_session_id?: string;
          round_number?: number;
          true_article_1?: string;
          true_article_1_url?: string;
          true_article_2?: string;
          true_article_2_url?: string;
          true_article_3?: string;
          true_article_3_url?: string;
          lie_article?: string;
          correct_answer?: number;
          started_at?: string;
          ended_at?: string | null;
        };
      };
      player_guesses: {
        Row: {
          id: string;
          game_round_id: string;
          player_id: string;
          guess: number;
          is_correct: boolean;
          guessed_at: string;
        };
        Insert: {
          id?: string;
          game_round_id: string;
          player_id: string;
          guess: number;
          is_correct: boolean;
          guessed_at?: string;
        };
        Update: {
          id?: string;
          game_round_id?: string;
          player_id?: string;
          guess?: number;
          is_correct?: boolean;
          guessed_at?: string;
        };
      };
    };
  };
};
