import type { Health, ModelInfo, PredictResponse } from "@/lib/types"

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
const API_BASE = RAW_BASE.replace(/\/+$/, "")

export class ApiError extends Error {
  status: number
  detail?: unknown

  constructor(message: string, status: number, detail?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    })
  } catch (cause) {
    throw new ApiError(
      cause instanceof Error ? cause.message : "network error",
      0,
      cause
    )
  }

  if (!response.ok) {
    let detail: unknown
    try {
      detail = await response.json()
    } catch {
      detail = await response.text().catch(() => undefined)
    }
    let message: string | undefined
    if (
      detail &&
      typeof detail === "object" &&
      "detail" in detail &&
      typeof (detail as { detail: unknown }).detail === "string"
    ) {
      message = (detail as { detail: string }).detail
    }
    const finalMessage =
      message ||
      response.statusText ||
      `request failed with status ${response.status}`
    throw new ApiError(finalMessage, response.status, detail)
  }

  return (await response.json()) as T
}

export function getHealth(): Promise<Health> {
  return request<Health>("/health")
}

export function getModelInfo(): Promise<ModelInfo> {
  return request<ModelInfo>("/model-info")
}

export function predict(text: string): Promise<PredictResponse> {
  return request<PredictResponse>("/predict", {
    method: "POST",
    body: JSON.stringify({ text }),
  })
}
