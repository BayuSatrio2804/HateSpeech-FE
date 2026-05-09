import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Loader2Icon, RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ApiError, getModelInfo } from "@/lib/api"
import type { Health, ModelInfo } from "@/lib/types"

type HealthLike = Health | { error: string } | null

type ModelInfoPanelProps = {
  health: HealthLike
  onRefreshHealth: () => Promise<void> | void
}

function isHealthData(value: HealthLike): value is Health {
  return value !== null && "model_loaded" in value
}

function describeError(err: unknown, t: (key: string) => string) {
  if (err instanceof ApiError) {
    if (err.status === 0) return t("errors.network")
    if (err.status === 503) return t("errors.modelUnavailable")
    return err.message || t("errors.unknown")
  }
  return t("errors.unknown")
}

export function ModelInfoPanel({
  health,
  onRefreshHealth,
}: ModelInfoPanelProps) {
  const { t } = useTranslation()
  const [model, setModel] = useState<ModelInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const info = await getModelInfo()
      setModel(info)
    } catch (err) {
      const message = describeError(err, t)
      setError(message)
      toast.error(t("modelInfo.error"), { description: message })
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const handleRefresh = async () => {
    await Promise.all([load(), onRefreshHealth()])
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-lg font-medium">
            {t("modelInfo.heading")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("modelInfo.description")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleRefresh()}
          disabled={loading}
        >
          {loading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <RefreshCwIcon />
          )}
          {t("modelInfo.refresh")}
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            {model?.model_name ?? t("modelInfo.loading")}
          </CardTitle>
          <CardDescription>
            {model?.model_key ?? "—"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : (
            <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <Field
                label={t("modelInfo.fields.labels")}
                value={model ? model.labels.join(", ") : "—"}
              />
              <Field
                label={t("modelInfo.fields.threshold")}
                value={model ? model.threshold.toFixed(2) : "—"}
              />
              <Field
                label={t("modelInfo.fields.maxLength")}
                value={model ? String(model.max_length) : "—"}
              />
              <Field
                label={t("modelInfo.fields.modelKey")}
                value={model?.model_key ?? "—"}
              />
            </dl>
          )}
          <Separator className="my-4" />
          <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <Field
              label={t("modelInfo.fields.backendStatus")}
              value={
                health === null
                  ? "—"
                  : isHealthData(health)
                    ? health.status
                    : t("status.unreachable")
              }
            />
            <Field
              label={t("modelInfo.fields.modelLoaded")}
              value={
                health === null
                  ? "—"
                  : isHealthData(health)
                    ? health.model_loaded
                      ? t("common.yes")
                      : t("common.no")
                    : t("common.no")
              }
            />
          </dl>
        </CardContent>
      </Card>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="font-mono text-xs">{value}</dd>
    </div>
  )
}
