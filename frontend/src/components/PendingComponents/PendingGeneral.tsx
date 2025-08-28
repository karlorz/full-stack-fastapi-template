import { Globe } from "lucide-react"

import { CustomCard } from "@/components/ui/custom-card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import DangerZoneAlert from "../Common/DangerZone"

const PendingGeneral = () => {
  return (
    <CustomCard title="General" description="Overview of your application.">
      <div className="space-y-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">App Information</h3>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 p-4 rounded-lg border">
              <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
                App Name
              </Label>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2 p-4 rounded-lg border">
              <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
                App URL
              </Label>
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-2 p-4 rounded-lg border">
              <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
                Deployment Status
              </Label>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 p-4 rounded-lg border">
            <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
              Recent Deployments
            </Label>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>

        <Separator />

        <DangerZoneAlert description="Permanently delete your data and everything associated with your app.">
          <Skeleton className="h-10 w-32" />
        </DangerZoneAlert>
      </div>
    </CustomCard>
  )
}

export default PendingGeneral
