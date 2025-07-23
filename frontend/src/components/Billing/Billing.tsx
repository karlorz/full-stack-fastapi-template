import { Download } from "lucide-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { CustomCard } from "../ui/custom-card"
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
      <CustomCard title="Billing Email">
        <p>team1@domain.com</p>
      </CustomCard>

      <CustomCard title="Current Plan">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <CurrentPlan />
          <PaymentMethod />
        </div>
      </CustomCard>

      <CustomCard title="Invoice History">
        <BillingTable />
      </CustomCard>
    </div>
  )
}

export default Billing
