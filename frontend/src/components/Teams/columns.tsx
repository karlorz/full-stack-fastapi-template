import type { ColumnDef } from "@tanstack/react-table"
import { Link, Users } from "lucide-react"
import type { Role, TeamPublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/utils"
import ActionsMenu from "./ActionsMenu"

export type TeamMember = {
  id: string
  email: string
  role: "admin" | "member"
  team: TeamPublic
  isCurrentUser: boolean
}

export type TeamLink = {
  id: string
  name: string
  slug: string
  isOwner: boolean
  isPersonalTeam: boolean
}

export const getTeamColumns = (
  currentUserRole?: Role,
): ColumnDef<TeamMember>[] => {
  const columns: ColumnDef<TeamMember>[] = [
    {
      accessorKey: "email",
      header: () => (
        <div className="font-medium text-muted-foreground">Member</div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {row.original.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-foreground">
              {row.original.email}
            </div>
            {row.original.isCurrentUser && (
              <Badge variant="muted" className="mt-1 text-xs">
                You
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: () => (
        <div className="font-medium text-muted-foreground">Role</div>
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.original.role === "admin" ? "success" : "muted"}
          className="text-xs font-medium"
        >
          {row.original.role === "admin" ? "Admin" : "Member"}
        </Badge>
      ),
    },
  ]

  if (currentUserRole === "admin") {
    columns.push({
      id: "actions",
      header: () => (
        <div className="font-medium text-muted-foreground text-center">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const { role, isCurrentUser, team } = row.original
        return (
          <div className="flex justify-center items-center">
            {!isCurrentUser ? (
              <ActionsMenu userRole={role} team={team} value={row.original} />
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        )
      },
    })
  }

  return columns
}

export const TEAM_COLUMNS = getTeamColumns()

export const ALL_TEAMS_COLUMNS: ColumnDef<TeamLink>[] = [
  {
    accessorKey: "name",
    header: () => <div className="font-medium text-muted-foreground">Team</div>,
    cell: ({ row }) => {
      const team = row.original

      return (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
            {team.isPersonalTeam ? (
              getInitials(team.name)
            ) : (
              <Users className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-foreground">{team.name}</div>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <Link className="h-3 w-3" />
              <span>/{team.slug}</span>
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "ownership",
    header: () => <div className="font-medium text-muted-foreground">Role</div>,
    cell: ({ row }) => {
      const team = row.original

      if (team.isPersonalTeam) {
        return (
          <Badge variant="default" className="text-xs">
            Personal
          </Badge>
        )
      }

      return team.isOwner ? (
        <Badge variant="success" className="text-xs">
          Owner
        </Badge>
      ) : (
        <Badge variant="muted" className="text-xs">
          Member
        </Badge>
      )
    },
  },
]
