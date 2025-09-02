export interface User {
  id: string
  name: string
  email: string
  nativeLanguage: string
  learningLanguage: string
}

export interface AuthContextType {
  user: User | null
  logout: () => void
}