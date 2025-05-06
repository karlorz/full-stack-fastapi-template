import { Link as RouterLink } from "@tanstack/react-router"
import { ChevronsUpDown, List, Plus, Users } from "lucide-react"

import type { TeamsPublic } from "@/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { getInitials } from "@/utils"

export function TeamSwitcher({
  teams,
  currentTeamSlug,
}: {
  teams: TeamsPublic
  currentTeamSlug: string
}) {
  const { isMobile } = useSidebar()
  const personalTeam = teams?.data.find((t) => t.is_personal_team)
  const selectedTeam = teams?.data.find((t) => t.slug === currentTeamSlug)
  const otherTeams = teams?.data.filter((t) => t.slug !== selectedTeam?.slug)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-testid="team-selector"
            >
              <div className="flex items-center w-full">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {selectedTeam?.is_personal_team ? (
                    getInitials(selectedTeam.name)
                  ) : (
                    <Users className="size-4" />
                  )}
                </div>
                <div className="mx-2 text-left flex-1 min-w-0">
                  <p className="truncate font-semibold">{selectedTeam?.name}</p>
                  {selectedTeam === personalTeam && (
                    <p className="truncate text-xs text-muted-foreground">
                      Personal Team
                    </p>
                  )}
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {otherTeams.slice(0, 3).map((team) => (
              <RouterLink to={`/${team.slug}`} key={team.id}>
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      {team.is_personal_team ? (
                        getInitials(team.name)
                      ) : (
                        <Users className="size-4 text-sidebar-primary-foreground" />
                      )}
                    </div>
                    <div className="max-w-[120px] truncate">
                      <span>{team.name}</span>
                      {team.slug && (
                        <p className="text-xs text-muted-foreground">
                          /{team.slug}
                        </p>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              </RouterLink>
            ))}
            <DropdownMenuSeparator />
            <RouterLink to="/teams/new">
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add team
                </div>
              </DropdownMenuItem>
            </RouterLink>
            {otherTeams?.length > 3 && (
              <RouterLink to="/teams/all">
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <List className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    View all teams
                  </div>
                </DropdownMenuItem>
              </RouterLink>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
