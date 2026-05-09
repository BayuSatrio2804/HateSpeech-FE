import { useTranslation } from "react-i18next"
import { MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from "@/components/theme-provider"

function getResolved(theme: "light" | "dark" | "system"): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
  return theme
}

export function ThemeToggle() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const resolved = getResolved(theme)
  const next = resolved === "dark" ? "light" : "dark"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("theme.toggle")}
            onClick={() => setTheme(next)}
          >
            {resolved === "dark" ? <MoonIcon /> : <SunIcon />}
          </Button>
        }
      />
      <TooltipContent>{t("theme.toggle")}</TooltipContent>
    </Tooltip>
  )
}
