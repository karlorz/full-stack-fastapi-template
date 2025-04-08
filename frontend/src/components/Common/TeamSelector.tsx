import { Link } from "@tanstack/react-router"
import { ChevronDown, type LucideIcon, Plus, Users } from "lucide-react"

import type { TeamsPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/utils"
import TeamIcon from "./TeamIcon"

interface MenuItemLinkProps {
  to: string
  icon?: LucideIcon
  initials?: string
  label: string | undefined
  onClick?: () => void
  bg: string
  slug?: string
}

const MenuItemLink = ({
  to,
  icon,
  label,
  onClick,
  initials,
  slug,
}: MenuItemLinkProps) => {
  return (
    <Link to={to} className="block">
      <DropdownMenuItem onClick={onClick}>
        <div className="flex items-center gap-2">
          <TeamIcon icon={icon} initials={initials || ""} />
          <div className="max-w-[120px] truncate">
            <span>{label}</span>
            {slug && <p className="text-xs text-muted-foreground">/{slug}</p>}
          </div>
        </div>
      </DropdownMenuItem>
    </Link>
  )
}

const TeamSelector = ({
  teams,
  currentTeamSlug,
}: {
  teams: TeamsPublic
  currentTeamSlug: string
}) => {
  const personalTeam = teams?.data.find((t) => t.is_personal_team)
  const selectedTeam = teams?.data.find((t) => t.slug === currentTeamSlug)
  const otherTeams = teams?.data.filter(
    (t) => !t.is_personal_team && t.slug !== selectedTeam?.slug,
  )

  return (
    <div className="flex justify-center py-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="py-6 w-full"
            data-testid="team-selector"
          >
            <div className="flex items-center w-full">
              <TeamIcon
                icon={selectedTeam?.is_personal_team ? undefined : Users}
                initials={
                  selectedTeam?.is_personal_team
                    ? getInitials(selectedTeam.name)
                    : undefined
                }
              />
              <div className="mx-2 text-left">
                <p className="w-[120px] truncate text-muted-foreground">
                  {selectedTeam?.name}
                </p>
                {selectedTeam === personalTeam && (
                  <p className="text-sm text-muted-foreground">Personal Team</p>
                )}
              </div>
              <ChevronDown className="text-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[280px]">
          {selectedTeam !== personalTeam && (
            <>
              <DropdownMenuGroup>
                <p className="px-4 py-2 text-xs font-bold">Personal Team</p>
                <MenuItemLink
                  to={`/${personalTeam?.slug}/`}
                  label={personalTeam?.name}
                  initials={
                    personalTeam?.name ? getInitials(personalTeam.name) : ""
                  }
                  bg="gradient"
                  slug={personalTeam?.slug}
                />
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          {otherTeams?.length > 0 && (
            <>
              <DropdownMenuGroup>
                <div className="flex justify-between px-4 py-2">
                  <p className="text-xs font-bold">Teams</p>
                  {otherTeams?.length > 3 && (
                    <Link to="/teams/all">
                      <Button variant="ghost" size="sm" className="underline">
                        View all teams
                      </Button>
                    </Link>
                  )}
                </div>
                {otherTeams?.slice(0, 3).map((team) => (
                  <MenuItemLink
                    key={team.id}
                    to={`/${team.slug}/`}
                    icon={Users}
                    label={team.name}
                    bg="main.dark"
                    slug={team.slug}
                  />
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <MenuItemLink
            to="/teams/new"
            icon={Plus}
            label="Add new team"
            bg="main.light"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default TeamSelector
