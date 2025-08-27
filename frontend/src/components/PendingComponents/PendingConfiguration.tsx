import { Code2 } from "lucide-react"

import { CustomCard } from "@/components/ui/custom-card"
import { Skeleton } from "@/components/ui/skeleton"

const PendingConfiguration = () => {
  return (
    <CustomCard
      title="Configuration"
      description="Application configuration and resource settings."
    >
      <div className="space-y-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-md font-medium">Environment Variables</h3>
          </div>

          <div className="space-y-4">
            {/* Loading skeleton for environment variables table */}
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-muted/50">
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      </div>
    </CustomCard>
  )
}

export default PendingConfiguration
