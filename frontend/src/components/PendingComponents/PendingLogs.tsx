import { Server, Terminal } from "lucide-react"

import { CustomCard } from "@/components/ui/custom-card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

const PendingLogs = () => {
  return (
    <CustomCard
      title="Logs"
      description="Application logs and monitoring data."
    >
      <div className="space-y-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-md font-medium">Real-time Logs</h3>
          </div>

          {/* Loading skeleton for logs viewer */}
          <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-4/5 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-md font-medium">Deployments Logs</h3>
          </div>

          {/* Loading skeleton for deployment logs */}
          <div className="space-y-4">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-10 w-28" />
            </div>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </div>
      </div>
    </CustomCard>
  )
}

export default PendingLogs
