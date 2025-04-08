import type { ColumnDef } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

interface LoadingTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
}

export function PendingTable<TData, TValue>({
  columns,
}: LoadingTableProps<TData, TValue>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array(columns.length)
              .fill(0)
              .map((_, i) => (
                <TableHead key={i}>
                  <div className="h-4 w-20 animate-pulse bg-muted rounded" />
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5)
            .fill(0)
            .map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array(columns.length)
                  .fill(0)
                  .map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <div className="h-4 w-full animate-pulse bg-muted rounded" />
                    </TableCell>
                  ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
