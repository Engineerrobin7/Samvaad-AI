export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string
          native_language: string
          learning_languages: string[]
          progress: JSON
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name: string
          native_language: string
          learning_languages?: string[]
          progress?: JSON
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string
          native_language?: string
          learning_languages?: string[]
          progress?: JSON
        }
      }
    }
  }
}