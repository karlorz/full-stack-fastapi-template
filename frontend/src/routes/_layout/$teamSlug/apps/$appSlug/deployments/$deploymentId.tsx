import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"

import Logs from "@/components/Deployment/Logs"
import { Status } from "@/components/Deployment/Status"
import PendingDeployment from "@/components/PendingComponents/PendingDeployment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAppQueryOptions } from "@/queries/apps"
import {
  getDeploymentQueryOptions,
  getLogsQueryOptions,
} from "@/queries/deployments"
import { getTeamQueryOptions } from "@/queries/teams"

export const Route = createFileRoute(
  "/_layout/$teamSlug/apps/$appSlug/deployments/$deploymentId",
)({
  component: DeploymentDetail,
  loader: async ({ context, params: { appSlug, teamSlug, deploymentId } }) => {
    try {
      const team = await context.queryClient.ensureQueryData(
        getTeamQueryOptions(teamSlug),
      )

      const app = await context.queryClient.ensureQueryData(
        getAppQueryOptions(team.id, appSlug),
      )

      await context.queryClient.ensureQueryData(
        getDeploymentQueryOptions(app.id, deploymentId),
      )
    } catch (_error) {
      throw notFound({ routeId: "/" })
    }
  },
  pendingComponent: PendingDeployment,
})

function DeploymentDetail() {
  const { teamSlug, appSlug, deploymentId } = Route.useParams()

  const { data: team } = useSuspenseQuery(getTeamQueryOptions(teamSlug))
  const { data: app } = useSuspenseQuery(getAppQueryOptions(team.id, appSlug))
  const { data: deployment } = useSuspenseQuery(
    getDeploymentQueryOptions(app.id, deploymentId),
  )
  const { data: logsData } = useSuspenseQuery(getLogsQueryOptions(deploymentId))

  return (
    <div className="container p-0 mx-auto w-full">
      <div className="flex items-center">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Deployment Details
        </h1>
      </div>

      <div className="mb-10">
        <p className="text-sm text-muted-foreground py-1">
          Last updated:{" "}
          {formatDistanceToNow(new Date(deployment.created_at), {
            addSuffix: true,
          })}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Status:</p>
          <Status status={deployment.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Logs logs={logsData.logs} />
        </CardContent>
      </Card>
    </div>
  )
}

export default DeploymentDetail
