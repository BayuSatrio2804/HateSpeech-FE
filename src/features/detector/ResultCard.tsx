import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { PredictResponse } from "@/lib/types"

type ResultCardProps = {
  result: PredictResponse
}

export function ResultCard({ result }: ResultCardProps) {
  const { t } = useTranslation()
  const isToxic = result.is_toxic
  const nonToxicPct = Math.round(result.scores.non_toxic * 100)
  const toxicPct = Math.round(result.scores.toxic * 100)

  return (
    <div className="flex flex-col gap-4 rounded-none bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-3">
        <Badge
          variant={isToxic ? "destructive" : "secondary"}
          className={cn(
            "h-8 px-3 text-sm tracking-wide uppercase",
            !isToxic && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          )}
        >
          {isToxic
            ? t("detector.result.verdictToxic")
            : t("detector.result.verdictNonToxic")}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {t("detector.result.thresholdNote", {
            threshold: result.threshold.toFixed(2),
          })}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <Progress value={nonToxicPct}>
          <ProgressLabel>{t("detector.result.labelNonToxic")}</ProgressLabel>
          <ProgressValue>{(_, value) => `${value ?? 0}%`}</ProgressValue>
        </Progress>
        <Progress value={toxicPct}>
          <ProgressLabel>{t("detector.result.labelToxic")}</ProgressLabel>
          <ProgressValue>{(_, value) => `${value ?? 0}%`}</ProgressValue>
        </Progress>
      </div>
    </div>
  )
}
