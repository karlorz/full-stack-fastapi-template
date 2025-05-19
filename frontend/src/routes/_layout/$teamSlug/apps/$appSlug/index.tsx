import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getAppLogsQueryOptions,
  getAppQueryOptions,
  getEnvVarQueryOptions,
} from "@/queries/apps"
import { getDeploymentsQueryOptions } from "@/queries/deployments"
import { getTeamQueryOptions } from "@/queries/teams"

export const Route = createFileRoute("/_layout/$teamSlug/apps/$appSlug/")({
  component: AppDetail,
  loader: async ({ context, params: { teamSlug, appSlug } }) => {
    try {
      const team = await context.queryClient.ensureQueryData(
        getTeamQueryOptions(teamSlug),
      )

      await context.queryClient.ensureQueryData(
        getAppQueryOptions(team.id, appSlug),
      )
    } catch (error) {
      throw notFound({ routeId: "/" })
    }
  },
  pendingComponent: PendingApp,
})

function AppDetail() {
  const { teamSlug, appSlug } = Route.useParams()

  const { data: team } = useSuspenseQuery(getTeamQueryOptions(teamSlug))
  const { data: app } = useSuspenseQuery(getAppQueryOptions(team.id, appSlug))
  const { data: deployments } = useSuspenseQuery(
    getDeploymentsQueryOptions(app.id),
  )
  const { data: environmentVariables } = useSuspenseQuery(
    getEnvVarQueryOptions(app.id),
  )
  const { data: logsData } = useSuspenseQuery(getAppLogsQueryOptions(app.id))

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight pb-10">
        App Details
      </h1>

      <Tabs defaultValue="general" className="space-y-6" data-testid="tabs">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* General Information Tab */}
        <TabsContent value="general">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle>App Details</CardTitle>
              </div>
              <CardDescription>Overview of your application</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-md font-medium">General Information</h3>
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2 p-4 rounded-lg border">
                      <div className="text-sm font-medium text-muted-foreground mb-6">
                        App Name
                      </div>
                      <div className="font-semibold">{app.name}</div>
                    </div>
                    <div className="space-y-2 p-4 rounded-lg border group">
                      <div className="text-sm font-medium text-muted-foreground mb-6">
                        App URL
                      </div>
                      {app.latest_deployment ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs font-mono text-primary hover:underline"
                          >
                            <Link className="h-3.5 w-3.5" />
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
                      <div className="text-sm font-medium text-muted-foreground mb-6">
                        Deployment Status
                      </div>
                      <Status status={app.latest_deployment?.status ?? null} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <RecentDeployments deployments={deployments.data} />
                </div>

                <Separator />

                <DangerZoneAlert description="Permanently delete your data and everything associated with your team">
                  <DeleteConfirmation appId={app.id} appSlug={appSlug} />
                </DangerZoneAlert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle>Configuration</CardTitle>
              </div>
              <CardDescription>
                Application configuration and resource settings
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Environment Variables */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-md font-medium">
                      Environment Variables
                    </h3>
                  </div>

                  <div>
                    <EnvironmentVariables
                      environmentVariables={environmentVariables?.data || []}
                      appId={app.id}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle>Logs</CardTitle>
              </div>
              <CardDescription>
                Application logs and monitoring data
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Real-time Logs */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-md font-medium">Real-time Logs</h3>
                  </div>
                  <Logs logs={logsData?.logs || []} />
                </div>

                <Separator />
                <Deployments deployments={deployments.data} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
