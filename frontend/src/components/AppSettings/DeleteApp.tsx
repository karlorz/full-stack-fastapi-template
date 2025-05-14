import { TriangleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import DeleteConfirmation from "./DeleteConfirmation"

const DeleteApp = ({ appSlug, appId }: { appSlug: string; appId: string }) => {
  return (
    <Alert className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-0">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <TriangleAlert className="h-4 w-4 text-red-700" />
        </div>
        <div>
          <AlertTitle className="text-[16px] text-red-700 font-semibold">
            Danger Zone
          </AlertTitle>
          <AlertDescription>
            Permanently delete your app and all its data.
          </AlertDescription>
        </div>
      </div>
      <DeleteConfirmation appId={appId} appSlug={appSlug} />
    </Alert>
  )
}

export default DeleteApp
