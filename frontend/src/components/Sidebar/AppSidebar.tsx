import {
  type ToOptions,
  linkOptions,
  useRouterState,
} from "@tanstack/react-router"
import { Home, LayoutGrid, type LucideIcon, Settings } from "lucide-react"
import { useEffect } from "react"

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

const getSidebarItems = ({ teamSlug }: { teamSlug: string }): Array<Item> => {
  return [
    {
      icon: Home,
      title: "Dashboard",
      ...linkOptions({
        to: "/$teamSlug/",
        params: { teamSlug },
      }),
    },
    {
      icon: LayoutGrid,
      title: "Apps",
      ...linkOptions({
        to: "/$teamSlug/apps",
        params: { teamSlug },
      }),
    },
    {
      icon: Settings,
      title: "Team Settings",
      ...linkOptions({
        to: "/$teamSlug/settings",
        params: { teamSlug },
      }),
    },
  ]
}

export function AppSidebar({ teams }: { teams: TeamsPublic }) {
  const currentUser = useCurrentUser()
  const matches = useRouterState({ select: (s) => s.matches })
  const lastMatch = matches[matches.length - 1]
  const team = lastMatch?.params.teamSlug

  const personalTeam = teams?.data.find((t) => t.is_personal_team)
  const currentTeamSlug =
    team || localStorage.getItem("current_team") || personalTeam?.slug || ""

  useEffect(() => {
    if (currentTeamSlug) {
      localStorage.setItem("current_team", currentTeamSlug)
    }
  }, [currentTeamSlug])

  const items = getSidebarItems({ teamSlug: currentTeamSlug })

  return (
    <Sidebar collapsible="icon">
      <a href="/" className="flex items-center self-center font-medium py-8">
        <img
          src={logo}
          alt="FastAPI Cloud"
          className="h-6 w-auto dark:invert-0 invert"
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
