import { useTranslation } from "react-i18next"
import { LanguagesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const LANGUAGES: { code: "en" | "id"; key: "language.en" | "language.id" }[] = [
  { code: "en", key: "language.en" },
  { code: "id", key: "language.id" },
]

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? i18n.language

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={t("language.label")}>
            <LanguagesIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {LANGUAGES.map(({ code, key }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => {
              void i18n.changeLanguage(code)
            }}
            data-active={current === code}
            className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
          >
            {t(key)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
