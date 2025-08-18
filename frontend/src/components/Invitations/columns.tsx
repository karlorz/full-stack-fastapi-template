import type { ColumnDef } from "@tanstack/react-table"
import { Calendar, Mail } from "lucide-react"
import type { InvitationPublic } from "@/client"
import { Badge } from "../ui/badge"
import CancelInvitation from "./CancelInvitation"

export const INVITATIONS_COLUMNS: ColumnDef<InvitationPublic>[] = [
  {
    accessorKey: "email",
    header: () => (
      <div className="font-medium text-muted-foreground">Invited User</div>
    ),
    cell: ({ row }) => {
      const invitation = row.original
      const invitedAt = new Date(invitation.created_at).toLocaleDateString()

      return (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-sm font-medium text-amber-800 dark:text-amber-400">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-foreground">
              {invitation.email}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Calendar className="h-3 w-3" />
              <span>Invited {invitedAt}</span>
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="font-medium text-muted-foreground">Status</div>
    ),
    cell: ({ row }) => (
      <Badge variant="warning" className="text-xs font-medium capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => (
      <div className="font-medium text-muted-foreground text-center">
        Actions
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center items-center">
        <CancelInvitation id={row.original.id} />
      </div>
    ),
  },
]
