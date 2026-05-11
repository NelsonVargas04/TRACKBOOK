export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Status = 'Aplicada' | 'Screening' | 'Entrevista' | 'Oferta' | 'Rechazada'
export type Source = 'LinkedIn' | 'Indeed' | 'GetOnBoard' | 'Glassdoor' | 'Referido' | 'Empresa' | 'Otro'

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: number
          created_at: string
          updated_at: string | null
          user_id: string
          role: string
          company: string
          status: Status
          stars: number
          type: string
          salary: string | null
          note: string | null
          contact: string | null
          tag: string | null
          url: string | null
          source: Source | null
          cv_id: number | null
          cover_letter_id: number | null
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'user_id'>
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
        Relationships: []
      }
      activity_entries: {
        Row: {
          id: number
          application_id: number
          created_at: string
          user_id: string
          label: string
          note: string | null
          date: string
        }
        Insert: Omit<Database['public']['Tables']['activity_entries']['Row'], 'id' | 'created_at' | 'user_id'>
        Update: Partial<Database['public']['Tables']['activity_entries']['Insert']>
        Relationships: []
      }
      cvs: {
        Row: {
          id: number
          created_at: string
          user_id: string
          cv_code: string
          name: string
          size: string
          url: string | null
          is_primary: boolean
        }
        Insert: Omit<Database['public']['Tables']['cvs']['Row'], 'id' | 'created_at' | 'user_id'>
        Update: Partial<Database['public']['Tables']['cvs']['Insert']>
        Relationships: []
      }
      cover_letters: {
        Row: {
          id: number
          created_at: string
          user_id: string
          cl_code: string
          name: string
          content: string
          preview: string
          is_primary: boolean
        }
        Insert: Omit<Database['public']['Tables']['cover_letters']['Row'], 'id' | 'created_at' | 'user_id'>
        Update: Partial<Database['public']['Tables']['cover_letters']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
