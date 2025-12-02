export interface Database {
  public: {
    Tables: {
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          tag: string
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          tag: string
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          tag?: string
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          workout_id: string
          name: string
          sets: number
          reps: number
          weight: number | null
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          name: string
          sets: number
          reps: number
          weight?: number | null
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          name?: string
          sets?: number
          reps?: number
          weight?: number | null
          order?: number
          created_at?: string
        }
      }
    }
  }
}

export type Workout = Database['public']['Tables']['workouts']['Row']
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert']
export type WorkoutUpdate = Database['public']['Tables']['workouts']['Update']

export type Exercise = Database['public']['Tables']['exercises']['Row']
export type ExerciseInsert = Database['public']['Tables']['exercises']['Insert']
export type ExerciseUpdate = Database['public']['Tables']['exercises']['Update']
