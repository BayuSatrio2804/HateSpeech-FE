import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useHistory } from "@/features/history/useHistory"
import { cn } from "@/lib/utils"

type HistoryPanelProps = {
  onLoadEntry: (text: string) => void
}

function useRelativeTime() {
  const { t } = useTranslation()
  return (createdAt: number) => {
    const diff = Date.now() - createdAt
    const minutes = Math.floor(diff / 60_000)
    if (minutes < 1) return t("history.relative.now")
    if (minutes < 60) return t("history.relative.minutes", { count: minutes })
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return t("history.relative.hours", { count: hours })
    const days = Math.floor(hours / 24)
    return t("history.relative.days", { count: days })
  }
}

export function HistoryPanel({ onLoadEntry }: HistoryPanelProps) {
  const { t } = useTranslation()
  const { entries, clear, restore, cap } = useHistory()
  const relative = useRelativeTime()

  const handleClear = () => {
    if (entries.length === 0) return
    const snapshot = entries
    clear()
    toast.success(t("history.clearedTitle"), {
      action: {
        label: t("history.undo"),
        onClick: () => restore(snapshot),
      },
    })
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-lg font-medium">
            {t("history.heading")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("history.description", { cap })}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={entries.length === 0}
              >
                <Trash2Icon />
                {t("history.clearAll")}
              </Button>
            }
          />
          <TooltipContent>{t("history.clearAll")}</TooltipContent>
        </Tooltip>
      </header>

      {entries.length === 0 ? (
        <p className="rounded-none border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          {t("history.empty")}
        </p>
      ) : (
        <ScrollArea className="max-h-[60vh] rounded-none bg-card ring-1 ring-foreground/10">
          <ul className="divide-y divide-border">
            {entries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onLoadEntry(entry.text)}
                  className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                  aria-label={t("history.loadEntry")}
                >
                  <Badge
                    variant={entry.label === "toxic" ? "destructive" : "secondary"}
                    className={cn(
                      "shrink-0 uppercase",
                      entry.label !== "toxic" &&
                        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    )}
                  >
                    {entry.label === "toxic"
                      ? t("detector.result.verdictToxic")
                      : t("detector.result.verdictNonToxic")}
                  </Badge>
                  <span className="line-clamp-2 flex-1 text-xs">
                    {entry.text}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {relative(entry.createdAt)}
                  </span>
                </button>
                <Separator />
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </section>
  )
}
