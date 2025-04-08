import type { ColumnDef } from "@tanstack/react-table"

import type { TeamPublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Link } from "lucide-react"
import ActionsMenu from "../Common/ActionsMenu"

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

export const TEAM_COLUMNS: ColumnDef<TeamMember>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div>
        {row.original.email}
        {row.original.isCurrentUser && (
          <Badge variant="secondary" className="ml-2">
            You
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (row.original.role === "admin" ? "Admin" : "Member"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { role, isCurrentUser, team } = row.original
      return !isCurrentUser ? (
        <ActionsMenu userRole={role} team={team} value={row.original} />
      ) : null
    },
  },
]

export const ALL_TEAMS_COLUMNS: ColumnDef<TeamLink>[] = [
  {
    accessorKey: "name",
    header: "Team Name",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{row.original.name}</span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Link className="h-3 w-3" />
            <span className="text-xs">{row.original.slug}</span>
          </Badge>
          {row.original.isPersonalTeam ? (
            <Badge variant="default" className="ml-2">
              Personal
            </Badge>
          ) : row.original.isOwner ? (
            <Badge variant="outline" className="ml-2">
              Owner
            </Badge>
          ) : (
            <Badge variant="outline" className="ml-2">
              Member
            </Badge>
          )}
        </div>
      </div>
    ),
  },
]
