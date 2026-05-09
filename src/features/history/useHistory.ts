import { useCallback, useEffect, useState } from "react"

import type { HistoryEntry } from "@/lib/types"

const STORAGE_KEY = "hatespeech.history"
const MAX_ENTRIES = 50

function readStorage(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is HistoryEntry =>
        entry &&
        typeof entry === "object" &&
        typeof entry.id === "string" &&
        typeof entry.text === "string" &&
        typeof entry.createdAt === "number"
    )
  } catch {
    return []
  }
}

function writeStorage(entries: HistoryEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // ignore quota / serialization issues
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => readStorage())

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setEntries(readStorage())
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const persist = useCallback((next: HistoryEntry[]) => {
    setEntries(next)
    writeStorage(next)
  }, [])

  const add = useCallback(
    (entry: Omit<HistoryEntry, "id" | "createdAt">) => {
      setEntries((prev) => {
        const next: HistoryEntry[] = [
          {
            ...entry,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: Date.now(),
          },
          ...prev,
        ].slice(0, MAX_ENTRIES)
        writeStorage(next)
        return next
      })
    },
    []
  )

  const clear = useCallback(() => persist([]), [persist])

  const restore = useCallback(
    (snapshot: HistoryEntry[]) => persist(snapshot),
    [persist]
  )

  return { entries, add, clear, restore, cap: MAX_ENTRIES }
}
