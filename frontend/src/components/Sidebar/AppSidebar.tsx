import type { ToOptions } from "@tanstack/react-router"
import { linkOptions, useParams } from "@tanstack/react-router"
import {
  Home,
  LayoutGrid,
  type LucideIcon,
  Puzzle,
  Settings,
} from "lucide-react"
import { useFeatureFlagEnabled } from "posthog-js/react"
import { useEffect, useMemo } from "react"
import logo from "@/assets/logo.svg"
import type { TeamsPublic } from "@/client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useCurrentUser } from "@/hooks/useAuth"
import { NavMain } from "./Main"
import { TeamSwitcher } from "./TeamSwitcher"
import { NavUser } from "./User"

export type Item = {
  icon: LucideIcon
  title: string
} & ToOptions

export function AppSidebar({ teams }: { teams: TeamsPublic }) {
  const currentUser = useCurrentUser()
  const { teamSlug } = useParams({ strict: false })

  const personalTeam = teams?.data.find((t) => t.is_personal_team)
  const currentTeamSlug =
    teamSlug || localStorage.getItem("current_team") || personalTeam?.slug || ""

  const integrationsEnabled = useFeatureFlagEnabled("integrations-enabled")

  useEffect(() => {
    if (currentTeamSlug) {
      localStorage.setItem("current_team", currentTeamSlug)
    }
  }, [currentTeamSlug])

  const items = useMemo(() => {
    return [
      {
        icon: Home,
        title: "Dashboard",
        ...linkOptions({
          to: "/$teamSlug",
          params: { teamSlug: currentTeamSlug },
        }),
      },
      {
        icon: LayoutGrid,
        title: "Apps",
        ...linkOptions({
          to: "/$teamSlug/apps",
          params: { teamSlug: currentTeamSlug },
        }),
      },
      integrationsEnabled
        ? {
            icon: Puzzle,
            title: "Integrations",
            ...linkOptions({
              to: "/$teamSlug/integrations",
              params: { teamSlug: currentTeamSlug },
            }),
          }
        : null,
      {
        icon: Settings,
        title: "Team Settings",
        ...linkOptions({
          to: "/$teamSlug/settings",
          params: { teamSlug: currentTeamSlug },
        }),
      },
    ].filter((x) => x !== null)
  }, [currentTeamSlug, integrationsEnabled])

  return (
    <Sidebar collapsible="icon">
      <a
        href="/"
        className="flex items-center self-center font-medium pt-16 pb-8"
      >
        <img
          src={logo}
          alt="FastAPI Cloud"
          className="h-8 w-auto dark:invert-0 invert"
        />
      </a>
      <SidebarHeader>
        <TeamSwitcher teams={teams} currentTeamSlug={currentTeamSlug} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
