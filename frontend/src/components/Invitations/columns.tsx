import type { InvitationPublic } from "@/client"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "../ui/badge"
import CancelInvitation from "./CancelInvitation"

export const INVITATIONS_COLUMNS: ColumnDef<InvitationPublic>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.original.email}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CancelInvitation id={row.original.id} />,
  },
]
