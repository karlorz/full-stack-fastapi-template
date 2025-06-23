import { Download } from "lucide-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Badge } from "../../components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { billings } from "./Billings"
import CurrentPlan from "./CurrentPlan"
import PaymentMethod from "./PaymentMethod"

function BillingTableBody() {
  return (
    <TableBody>
      {billings.map(({ id, invoice, amount, date, status }) => {
        const data = [
          invoice,
          amount,
          date,
          <Badge
            key={status}
            variant={status === "Paid" ? "default" : "destructive"}
          >
            {status}
          </Badge>,
          <Download key="download" className="h-4 w-4 cursor-pointer" />,
        ]

        return (
          <TableRow key={id} className="hover:bg-muted/50">
            {data.map((item, index) => (
              <TableCell key={index}>{item}</TableCell>
            ))}
          </TableRow>
        )
      })}
    </TableBody>
  )
}

function BillingTable() {
  const headers = ["Invoice", "Amount", "Date", "Status", "Actions"]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header) => (
            <TableHead key={header} className="capitalize">
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <TableBody>
            <TableRow>
              <TableCell colSpan={4}>
                Something went wrong: {error.message}
              </TableCell>
            </TableRow>
          </TableBody>
        )}
      >
        <Suspense
          fallback={
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          }
        >
          <BillingTableBody />
        </Suspense>
      </ErrorBoundary>
    </Table>
  )
}

const Billing = () => {
  return (
    <div className="container my-4 p-0">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Billing Email</CardTitle>
        </CardHeader>
        <CardContent>
          <p>team1@domain.com</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 p-4">
            <CurrentPlan />
            <PaymentMethod />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <BillingTable />
        </CardContent>
      </Card>
    </div>
  )
}

export default Billing
