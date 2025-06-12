export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leaderboard: {
        Row: {
          id: string
          created_at: string
          first_name: string
          last_name: string
          email: string
          score: number
          lives_remaining: number
          questions_answered: number
          game_status: 'success' | 'failure'
          persona: string | null
          time_taken: number | null
          completed_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          first_name: string
          last_name: string
          email: string
          score: number
          lives_remaining: number
          questions_answered: number
          game_status: 'success' | 'failure'
          persona?: string | null
          time_taken?: number | null
          completed_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          first_name?: string
          last_name?: string
          email?: string
          score?: number
          lives_remaining?: number
          questions_answered?: number
          game_status?: 'success' | 'failure'
          persona?: string | null
          time_taken?: number | null
          completed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 