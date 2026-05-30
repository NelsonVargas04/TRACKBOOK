export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Status = 'Aplicada' | 'Screening' | 'Entrevista' | 'Oferta' | 'Rechazada' | 'Ghosteado' | 'En Proceso'
export type Source = string

type ApplicationsRow = {
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

type ActivityEntriesRow = {
  id: number
  application_id: number
  created_at: string
  user_id: string
  label: string
  note: string | null
  date: string
}

type CvsRow = {
  id: number
  created_at: string
  user_id: string
  cv_code: string
  name: string
  size: string
  url: string | null
  is_primary: boolean
}

type CoverLettersRow = {
  id: number
  created_at: string
  user_id: string
  cl_code: string
  name: string
  content: string
  preview: string
  is_primary: boolean
}

type ProfilesRow = {
  id: string
  email: string
  full_name: string | null
  role: string | null
}

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: ApplicationsRow
        Insert: Omit<ApplicationsRow, 'id' | 'created_at' | 'user_id'> & {
          id?: number
          created_at?: string
          user_id?: string
        }
        Update: Partial<ApplicationsRow>
        Relationships: []
      }
      activity_entries: {
        Row: ActivityEntriesRow
        Insert: Omit<ActivityEntriesRow, 'id' | 'created_at' | 'user_id'> & {
          id?: number
          created_at?: string
          user_id?: string
        }
        Update: Partial<ActivityEntriesRow>
        Relationships: []
      }
      cvs: {
        Row: CvsRow
        Insert: Omit<CvsRow, 'id' | 'created_at' | 'user_id' | 'url'> & {
          id?: number
          created_at?: string
          user_id?: string
          url?: string | null
        }
        Update: Partial<CvsRow>
        Relationships: []
      }
      cover_letters: {
        Row: CoverLettersRow
        Insert: Omit<CoverLettersRow, 'id' | 'created_at' | 'user_id'> & {
          id?: number
          created_at?: string
          user_id?: string
        }
        Update: Partial<CoverLettersRow>
        Relationships: []
      }
      profiles: {
        Row: ProfilesRow
        Insert: ProfilesRow
        Update: Partial<ProfilesRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
