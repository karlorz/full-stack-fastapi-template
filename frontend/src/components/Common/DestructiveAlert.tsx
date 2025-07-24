import { AlertTriangle } from "lucide-react"
import { Alert, AlertTitle } from "@/components/ui/alert"

interface DestructiveAlertProps {
  message?: string
}

export function DestructiveAlert({
  message = "Warning: This action cannot be undone.",
}: DestructiveAlertProps) {
  return (
    <Alert
      variant="destructive"
      className="text-xs bg-destructive/10 text-destructive p-3 rounded-md mt-4 flex items-center gap-2"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <AlertTitle className="text-xs font-normal">{message}</AlertTitle>
    </Alert>
  )
}
