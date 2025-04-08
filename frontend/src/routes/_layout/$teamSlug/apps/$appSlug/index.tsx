import { useQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { ExternalLink } from "lucide-react"

import { AppsService, DeploymentsService } from "@/client"
import DeleteApp from "@/components/AppSettings/DeleteApp"
import Deployments from "@/components/AppSettings/Deployments"
import EnvironmentVariables from "@/components/AppSettings/EnvironmentVariables"
import PendingApp from "@/components/PendingComponents/PendingApp"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchTeamBySlug } from "@/utils"

export const Route = createFileRoute("/_layout/$teamSlug/apps/$appSlug/")({
  component: AppDetail,
  loader: async ({ context, params }) => {
    try {
      const team = await fetchTeamBySlug(params.teamSlug)

      if (!team) {
        throw notFound({ routeId: "/" })
      }

      const apps = await AppsService.readApps({
        teamId: team.id,
        slug: params.appSlug,
      })

      if (apps.data.length === 0) {
        throw notFound({ routeId: "/" })
      }

      const deployments = await DeploymentsService.readDeployments({
        appId: apps.data[0].id,
        orderBy: "created_at",
        limit: 5,
      })

      const app = apps.data[0]

      await context.queryClient.ensureQueryData({
        queryKey: ["apps", app.id, "environmentVariables"],
        queryFn: () => AppsService.readEnvironmentVariables({ appId: app.id }),
      })

      return { app, deployments }
    } catch (error) {
      throw notFound({ routeId: "/" })
    }
  },
  pendingComponent: PendingApp,
})

function AppDetail() {
  const { app, deployments: initialDeployments } = Route.useLoaderData()

  const { data: deployments } = useQuery({
    queryKey: ["deployments", app.id],
    queryFn: () =>
      DeploymentsService.readDeployments({
        appId: app.id,
        orderBy: "created_at",
        limit: 5,
      }),
    initialData: initialDeployments,
    refetchInterval: 10000,
  })

  const { data: environmentVariables } = useQuery({
    queryKey: ["apps", app.id, "environmentVariables"],
    queryFn: () => AppsService.readEnvironmentVariables({ appId: app.id }),
  })

  return (
    <div className="container max-w-full p-0">
      <h1 className="text-2xl font-extrabold tracking-tight">{app?.name}</h1>
      <div className="pb-10">
        {app.url && (
          <a
            href={app.url}
            className="text-sm text-primary font-bold hover:underline flex items-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {app.url}
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        <p className="text-sm text-muted-foreground">
          Last Updated: {new Date(app?.updated_at).toLocaleString()}
        </p>
        <div className="pt-10 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <Deployments deployments={deployments.data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <EnvironmentVariables
                environmentVariables={environmentVariables?.data || []}
                appId={app.id}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <DeleteApp appSlug={app.slug} appId={app.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
