import { Calendar, Mail } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

export function PendingInvitations() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="font-medium text-muted-foreground">
                Invited User
              </div>
            </TableHead>
            <TableHead>
              <div className="font-medium text-muted-foreground">Status</div>
            </TableHead>
            <TableHead>
              <div className="font-medium text-muted-foreground text-center">
                Actions
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(3)
            .fill(0)
            .map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-sm font-medium text-amber-800 dark:text-amber-400">
                      <Mail className="h-4 w-4 opacity-50" />
                    </div>
                    <div>
                      <div className="h-4 w-40 animate-pulse bg-muted rounded font-medium" />
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3 text-muted-foreground opacity-50" />
                        <div className="h-3 w-28 animate-pulse bg-muted rounded text-xs" />
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center justify-center rounded-md border border-transparent bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 h-5 w-16 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center items-center">
                    <div className="h-8 w-8 animate-pulse bg-muted rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
