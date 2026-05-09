export type Health = {
  status: string
  model_loaded: boolean
}

export type ModelInfo = {
  model_key: string
  model_name: string
  labels: string[]
  threshold: number
  max_length: number
}

export type PredictionScores = {
  non_toxic: number
  toxic: number
}

export type PredictRequest = {
  text: string
}

export type PredictResponse = {
  label: "non_toxic" | "toxic"
  is_toxic: boolean
  scores: PredictionScores
  threshold: number
}

export type HistoryEntry = {
  id: string
  text: string
  label: "non_toxic" | "toxic"
  scores: PredictionScores
  threshold: number
  createdAt: number
}
