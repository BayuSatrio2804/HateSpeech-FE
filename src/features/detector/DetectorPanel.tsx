import { useEffect, useState, type KeyboardEvent } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Loader2Icon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ResultCard } from "@/features/detector/ResultCard"
import { SampleChips } from "@/features/detector/SampleChips"
import { useHistory } from "@/features/history/useHistory"
import { ApiError, predict } from "@/lib/api"
import type { PredictResponse } from "@/lib/types"

const MAX_LENGTH = 5000

type DetectorPanelProps = {
  pendingText: string | null
  onTextConsumed: () => void
  onPredictionFailed: () => void
}

function describeError(err: unknown, t: (key: string) => string) {
  if (err instanceof ApiError) {
    if (err.status === 0) return t("errors.network")
    if (err.status === 422) return t("errors.validation")
    if (err.status === 503) return t("errors.modelUnavailable")
    return err.message || t("errors.unknown")
  }
  return t("errors.unknown")
}

export function DetectorPanel({
  pendingText,
  onTextConsumed,
  onPredictionFailed,
}: DetectorPanelProps) {
  const { t } = useTranslation()
  const { add } = useHistory()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (pendingText !== null) {
      setText(pendingText)
      setResult(null)
      setError(null)
      onTextConsumed()
    }
  }, [pendingText, onTextConsumed])

  const trimmed = text.trim()
  const tooLong = text.length > MAX_LENGTH
  const canSubmit = !loading && trimmed.length > 0 && !tooLong

  const submit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const response = await predict(trimmed)
      setResult(response)
      add({
        text: trimmed,
        label: response.label,
        scores: response.scores,
        threshold: response.threshold,
      })
    } catch (err) {
      const message = describeError(err, t)
      setError(message)
      setResult(null)
      toast.error(t("detector.errorTitle"), { description: message })
      onPredictionFailed()
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      void submit()
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-lg font-medium">
          {t("detector.heading")}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t("detector.description")}
        </p>
      </header>

      <SampleChips onPick={setText} disabled={loading} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="detector-input" className="sr-only">
          {t("detector.heading")}
        </Label>
        <Textarea
          id="detector-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("detector.placeholder")}
          rows={6}
          aria-invalid={tooLong || undefined}
          className="min-h-32 resize-y"
          disabled={loading}
        />
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>{t("detector.shortcutHint")}</span>
          <span
            className={tooLong ? "text-destructive" : undefined}
            data-slot="char-counter"
          >
            {t("detector.counter", { count: text.length, max: MAX_LENGTH })}
          </span>
        </div>
        {tooLong && (
          <p className="text-xs text-destructive">
            {t("detector.tooLong", { max: MAX_LENGTH })}
          </p>
        )}
      </div>

      <div>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={!canSubmit}
          size="lg"
        >
          {loading ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
          {loading ? t("detector.analyzing") : t("detector.analyze")}
        </Button>
      </div>

      {error && !loading && (
        <div className="rounded-none border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <p className="font-medium">{t("detector.errorTitle")}</p>
          <p className="mt-1 text-destructive/90">{error}</p>
        </div>
      )}

      {result && !error && <ResultCard result={result} />}
    </section>
  )
}
