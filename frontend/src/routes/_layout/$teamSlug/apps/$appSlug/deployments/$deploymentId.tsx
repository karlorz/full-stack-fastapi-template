import { useQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"

import { AppsService, DeploymentsService } from "@/client"
import Logs from "@/components/Deployment/Logs"
import { Status } from "@/components/Deployment/Status"
import PendingDeployment from "@/components/PendingComponents/PendingDeployment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchTeamBySlug } from "@/utils"

export const Route = createFileRoute(
  "/_layout/$teamSlug/apps/$appSlug/deployments/$deploymentId",
)({
  component: DeploymentDetail,
  loader: async ({ params }) => {
    try {
      const team = await fetchTeamBySlug(params.teamSlug)
      const apps = await AppsService.readApps({
        teamId: team.id,
        slug: params.appSlug,
      })
      const app = apps.data[0]

      const deployment = await DeploymentsService.readDeployment({
        appId: app.id,
        deploymentId: params.deploymentId,
      })

      const { logs } = await DeploymentsService.readDeploymentLogs({
        deploymentId: deployment.id,
      })

      return { deployment, logs }
    } catch (error) {
      throw notFound({ routeId: "/" })
    }
  },
  pendingComponent: PendingDeployment,
})

function DeploymentDetail() {
  const { deployment: initialDeployment, logs: initialLogs } =
    Route.useLoaderData()

  const { data: deployment } = useQuery({
    queryKey: ["deployments", initialDeployment.id],
    queryFn: () =>
      DeploymentsService.readDeployment({
        appId: initialDeployment.app_id,
        deploymentId: initialDeployment.id,
      }),
    initialData: initialDeployment,
    refetchInterval: 5000,
  })

  const { data } = useQuery({
    queryKey: ["deployment-logs", initialDeployment.id],
    queryFn: () =>
      DeploymentsService.readDeploymentLogs({
        deploymentId: initialDeployment.id,
      }),
    initialData: { logs: initialLogs },
    refetchInterval: 5000,
  })

  return (
    <div className="container p-0 mx-auto w-full">
      <div className="flex items-center">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Deployment Details
        </h1>
      </div>

      <div className="mb-10">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date(deployment?.updated_at).toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Status:</p>
          <Status deployment={deployment} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Logs logs={data.logs} />
        </CardContent>
      </Card>
    </div>
  )
}

export default DeploymentDetail
