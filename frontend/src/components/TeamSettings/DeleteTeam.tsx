import { TriangleAlert } from "lucide-react"

import type { TeamPublic } from "@/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import DeleteConfirmation from "./DeleteConfirmation"

const DeleteTeam = ({ team }: { team: TeamPublic }) => {
  return (
    <Alert
      variant="destructive"
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-0"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive">
          <TriangleAlert className="h-4 w-4 text-stone-50" />
        </div>
        <div>
          <AlertTitle className="text-[16px] font-semibold">
            Danger Zone
          </AlertTitle>
          <AlertDescription>
            Permanently delete your data and everything associated with your
            team.
          </AlertDescription>
        </div>
      </div>
      <DeleteConfirmation team={team} />
    </Alert>
  )
}

export default DeleteTeam
