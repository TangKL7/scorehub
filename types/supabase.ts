export type Tables = {
  scores: {
    id: string
    created_at: string
    user_id: string
    score: number
    game_type: string
    // Add other fields as needed
  }
}

export type DbResponse<T> = {
  data: T | null
  error: Error | null
} 