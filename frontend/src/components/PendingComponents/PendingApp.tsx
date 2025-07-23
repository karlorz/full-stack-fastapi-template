import { Globe } from "lucide-react"
import { Fragment } from "react"

import { CustomCard } from "@/components/ui/custom-card"
import { Label } from "@/components/ui/label"
import { Section } from "@/components/ui/section"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DangerZoneAlert from "../Common/DangerZone"

const PendingApp = () => {
  return (
    <Section title="App Details">
      <Tabs defaultValue="general" className="space-y-12">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <CustomCard
            title="General"
            description="Overview of your application."
          >
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-md font-medium">App Information</h3>
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
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="space-y-2 p-4 rounded-lg border">
                    <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
                      Deployment Status
                    </Label>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 p-4 rounded-lg border">
                  <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
                    Recent Deployments
                  </Label>
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              <Separator />

              <DangerZoneAlert description="Permanently delete your data and everything associated with your account">
                <Skeleton className="h-10 w-32" />
              </DangerZoneAlert>
            </div>
          </CustomCard>
        </TabsContent>
        <TabsContent value="configuration">
          <CustomCard
            title="Configuration"
            description="Application configuration and resource settings."
          >
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Fragment key={i}>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Separator />
                </Fragment>
              ))}
            </div>
          </CustomCard>
        </TabsContent>
        <TabsContent value="logs">
          <CustomCard
            title="Logs"
            description="Application logs and monitoring data."
          >
            <div className="bg-secondary/50 rounded-lg p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full mb-2" />
              ))}
            </div>
          </CustomCard>
        </TabsContent>
      </Tabs>
    </Section>
  )
}

export default PendingApp
