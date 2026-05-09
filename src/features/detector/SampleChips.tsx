import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

const SAMPLES = [
  "Selamat pagi semuanya, semoga harimu menyenangkan!",
  "Dasar bodoh, kamu tidak pantas hidup di sini.",
  "Saya sangat kecewa dengan pelayanan restoran ini.",
  "Pemerintah harus lebih memperhatikan rakyat kecil.",
]

type SampleChipsProps = {
  onPick: (text: string) => void
  disabled?: boolean
}

export function SampleChips({ onPick, disabled }: SampleChipsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">{t("detector.samples")}</span>
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <Button
            key={sample}
            type="button"
            variant="outline"
            size="xs"
            disabled={disabled}
            onClick={() => onPick(sample)}
            className="max-w-full whitespace-normal text-left"
          >
            <span className="line-clamp-1">{sample}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
