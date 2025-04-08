import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const PendingTeamInformation = () => (
  <div className="w-full my-4 pt-10">
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Team Name</h3>
      <Skeleton className="h-5 w-full md:w-1/2" />
    </Card>
  </div>
)

export default PendingTeamInformation
