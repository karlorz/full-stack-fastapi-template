import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const PendingDeployment = () => (
  <div className="w-full p-0">
    <div className="flex items-center">
      <h1 className="text-3xl font-bold pb-2">Deployment Details</h1>
    </div>

    <div className="mb-4">
      <Skeleton className="h-5 w-[200px]" />
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="h-5 w-[50px]" />
        <Skeleton className="h-5 w-[100px]" />
      </div>
    </div>

    <Card className="p-6">
      <h3 className="font-semibold mb-4">Logs</h3>
      <Skeleton className="h-[400px]" />
    </Card>
  </div>
)

export default PendingDeployment
