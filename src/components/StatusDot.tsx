import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type StatusDotProps = {
  state: "healthy" | "unreachable" | "checking"
}

export function StatusDot({ state }: StatusDotProps) {
  const { t } = useTranslation()

  const tooltip =
    state === "healthy"
      ? t("status.healthy")
      : state === "unreachable"
        ? t("status.unreachable")
        : t("status.checking")

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            aria-label={tooltip}
            className="inline-flex size-6 items-center justify-center"
          >
            <span
              className={cn(
                "block size-2.5 rounded-full ring-2 ring-offset-2 ring-offset-background transition-colors",
                state === "healthy" && "bg-emerald-500 ring-emerald-500/30",
                state === "unreachable" && "bg-destructive ring-destructive/30",
                state === "checking" && "bg-muted-foreground/60 ring-muted-foreground/20 animate-pulse"
              )}
            />
          </span>
        }
      />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
