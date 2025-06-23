import { TriangleAlert } from "lucide-react"
import type { ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DangerZoneAlertProps {
  description: string
  children: ReactNode
}

const DangerZoneAlert = ({ description, children }: DangerZoneAlertProps) => {
  return (
    <Alert
      variant="destructive"
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-0 px-0"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
          <TriangleAlert className="h-4 w-4" />
        </div>
        <div>
          <AlertTitle className="text-[16px] font-semibold">
            Danger Zone
          </AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </div>
      </div>
      {children}
    </Alert>
  )
}

export default DangerZoneAlert
