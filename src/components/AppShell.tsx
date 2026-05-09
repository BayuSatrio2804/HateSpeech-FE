import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  GaugeIcon,
  HistoryIcon,
  InfoIcon,
  ShieldAlertIcon,
} from "lucide-react"

import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { StatusDot } from "@/components/StatusDot"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DetectorPanel } from "@/features/detector/DetectorPanel"
import { HistoryPanel } from "@/features/history/HistoryPanel"
import { ModelInfoPanel } from "@/features/model-info/ModelInfoPanel"
import { getHealth } from "@/lib/api"
import type { Health } from "@/lib/types"

type Panel = "detector" | "history" | "model-info"

type HealthState =
  | { status: "checking" }
  | { status: "healthy"; data: Health }
  | { status: "unreachable"; error: string }

export function AppShell() {
  const { t } = useTranslation()
  const [activePanel, setActivePanel] = useState<Panel>("detector")
  const [pendingText, setPendingText] = useState<string | null>(null)
  const [health, setHealth] = useState<HealthState>({ status: "checking" })

  const refreshHealth = useCallback(async () => {
    setHealth({ status: "checking" })
    try {
      const data = await getHealth()
      setHealth(
        data.model_loaded
          ? { status: "healthy", data }
          : { status: "unreachable", error: "model not loaded" }
      )
    } catch (err) {
      setHealth({
        status: "unreachable",
        error: err instanceof Error ? err.message : "unknown error",
      })
    }
  }, [])

  useEffect(() => {
    void refreshHealth()
  }, [refreshHealth])

  const loadIntoDetector = useCallback((text: string) => {
    setPendingText(text)
    setActivePanel("detector")
  }, [])

  const navItems: { key: Panel; label: string; icon: React.ReactNode }[] = [
    { key: "detector", label: t("nav.detector"), icon: <GaugeIcon /> },
    { key: "history", label: t("nav.history"), icon: <HistoryIcon /> },
    { key: "model-info", label: t("nav.modelInfo"), icon: <InfoIcon /> },
  ]

  const dotState =
    health.status === "checking"
      ? "checking"
      : health.status === "healthy"
        ? "healthy"
        : "unreachable"

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <ShieldAlertIcon className="size-4 text-primary" />
            <div className="flex min-w-0 flex-col">
              <span className="font-heading text-sm font-medium leading-tight">
                {t("app.title")}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {t("app.subtitle")}
              </span>
            </div>
          </div>
        </SidebarHeader>
        <Separator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={activePanel === item.key}
                      onClick={() => setActivePanel(item.key)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-2">
            <StatusDot state={dotState} />
            <span className="hidden font-heading text-sm font-medium md:inline">
              {t("app.title")}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-3xl">
            {activePanel === "detector" && (
              <DetectorPanel
                pendingText={pendingText}
                onTextConsumed={() => setPendingText(null)}
                onPredictionFailed={refreshHealth}
              />
            )}
            {activePanel === "history" && (
              <HistoryPanel onLoadEntry={loadIntoDetector} />
            )}
            {activePanel === "model-info" && (
              <ModelInfoPanel
                health={
                  health.status === "healthy"
                    ? health.data
                    : health.status === "unreachable"
                      ? { error: health.error }
                      : null
                }
                onRefreshHealth={refreshHealth}
              />
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
