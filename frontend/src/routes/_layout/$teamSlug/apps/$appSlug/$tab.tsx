import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router"
import { Code2, Globe, Link, Terminal } from "lucide-react"

import DeleteConfirmation from "@/components/AppSettings/DeleteConfirmation"
import Deployments, {
  RecentDeployments,
} from "@/components/AppSettings/Deployments"
import EnvironmentVariables from "@/components/AppSettings/EnvironmentVariables"
import DangerZoneAlert from "@/components/Common/DangerZone"
import Logs from "@/components/Deployment/Logs"
import { Status } from "@/components/Deployment/Status"
import PendingApp from "@/components/PendingComponents/PendingApp"
import { CustomCard } from "@/components/ui/custom-card"
import { Label } from "@/components/ui/label"
import { Section } from "@/components/ui/section"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getAppLogsQueryOptions,
  getAppQueryOptions,
  getEnvVarQueryOptions,
} from "@/queries/apps"
import { getDeploymentsQueryOptions } from "@/queries/deployments"
import { getTeamQueryOptions } from "@/queries/teams"

export const Route = createFileRoute("/_layout/$teamSlug/apps/$appSlug/$tab")({
  component: AppDetail,
  loader: async ({ context, params: { teamSlug, appSlug } }) => {
    try {
      const team = await context.queryClient.ensureQueryData(
        getTeamQueryOptions(teamSlug),
      )

      await context.queryClient.ensureQueryData(
        getAppQueryOptions(team.id, appSlug),
      )
    } catch (_error) {
      throw notFound({ routeId: "/" })
    }
  },
  pendingComponent: PendingApp,
})

function AppDetail() {
  const { teamSlug, appSlug, tab } = Route.useParams()
  const navigate = useNavigate()

  const { data: team } = useSuspenseQuery(getTeamQueryOptions(teamSlug))
  const { data: app } = useSuspenseQuery(getAppQueryOptions(team.id, appSlug))
  const { data: deployments } = useSuspenseQuery(
    getDeploymentsQueryOptions(app.id),
  )
  const { data: environmentVariables } = useSuspenseQuery(
    getEnvVarQueryOptions(app.id),
  )
  const { data: logsData } = useSuspenseQuery(getAppLogsQueryOptions(app.id))

  const handleTabChange = (newTab: string) => {
    if (newTab !== tab) {
      navigate({
        to: "/$teamSlug/apps/$appSlug/$tab",
        params: { teamSlug, appSlug: app.slug, tab: newTab },
      })
    }
  }

  return (
    <Section title="App Details">
      <Tabs
        className="space-y-12"
        data-testid="tabs"
        value={tab}
        onValueChange={handleTabChange}
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* General Information Tab */}
        <TabsContent value="general">
          <CustomCard
            title="General"
            description="Overview of your application."
          >
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-4 w-4" />
                  <h3 className="text-md font-medium">App Information</h3>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2 p-4 rounded-lg border ">
                    <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
                      App Name
                    </Label>
                    <div className="text-muted-foreground flex items-center">
                      <span className="truncate overflow-hidden whitespace-nowrap w-full pr-2">
                        {app.name}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg border group">
                    <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
                      App URL
                    </Label>
                    {app.latest_deployment ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs font-mono text-primary hover:underline"
                        >
                          <Link className="h-3.5 w-3.5 text-muted-foreground" />
                          {app.url}
                        </a>
                      </div>
                    ) : (
                      <span className="text-sm my-2 text-muted-foreground">
                        URL will be available after deployment
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 p-4 rounded-lg border">
                    <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
                      Deployment Status
                    </Label>
                    <Status status={app.latest_deployment?.status ?? null} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <RecentDeployments deployments={deployments.data} />
              </div>

              <Separator />

              <DangerZoneAlert description="Permanently delete your data and everything associated with your app.">
                <DeleteConfirmation appId={app.id} appSlug={appSlug} />
              </DangerZoneAlert>
            </div>
          </CustomCard>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration">
          <CustomCard
            title="Configuration"
            description="Application configuration and resource settings."
          >
            <div className="space-y-12">
              {/* Environment Variables */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="h-5 w-5" />
                  <h3 className="text-md font-medium">Environment Variables</h3>
                </div>

                <div>
                  <EnvironmentVariables
                    environmentVariables={environmentVariables?.data || []}
                    appId={app.id}
                  />
                </div>
              </div>
            </div>
          </CustomCard>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <CustomCard
            title="Logs"
            description="Application logs and monitoring data."
          >
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="h-5 w-5" />
                  <h3 className="text-md font-medium">Real-time Logs</h3>
                </div>
                <Logs logs={logsData?.logs || []} />
              </div>
              <Separator />
              <Deployments deployments={deployments.data} />
            </div>
          </CustomCard>
        </TabsContent>
      </Tabs>
    </Section>
  )
}
