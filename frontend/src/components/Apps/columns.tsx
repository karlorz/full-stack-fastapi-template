import { Badge } from "@/components/ui/badge"
import type { ColumnDef } from "@tanstack/react-table"
import { Calendar, Link } from "lucide-react"

import type { AppPublic } from "../../client/models"

export const ALL_APPS_COLUMNS: ColumnDef<AppPublic>[] = [
  {
    accessorKey: "name",
    header: "App Name",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{row.original.name}</span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Link className="h-3 w-3" />
            <span className="text-xs">{row.original.slug}</span>
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-1 h-3 w-3" />
          {new Date(row.original.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
    ),
  },
]
