import { Badge } from "@/components/ui/badge"
import type { ColumnDef } from "@tanstack/react-table"
import { Calendar, Link } from "lucide-react"

import type { AppPublic } from "../../client/models"

export const ALL_APPS_COLUMNS: ColumnDef<AppPublic>[] = [
  {
    accessorKey: "name",
    header: "App Name",
    cell: ({ row }) => (
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {new Date(row.original.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
        <div>
          <Badge variant="outline" className="flex items-center gap-1">
            <a
              href={row.original.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2"
            >
              <Link className="h-3 w-3" />
              <span className="text-xs">{row.original.url}</span>
            </a>
          </Badge>
        </div>
      </div>
    ),
  },
]
