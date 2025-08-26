import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import type { DeploymentStatus } from "@/client"
import Logs from "@/components/Deployment/Logs"
import { Status } from "@/components/Deployment/Status"
import PendingDeployment from "@/components/PendingComponents/PendingDeployment"
import { Section } from "@/components/ui/section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBuildLogs } from "@/hooks/use-build-logs"
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

      const deployment = await context.queryClient.ensureQueryData(
        getDeploymentQueryOptions(app.id, deploymentId),
      )

      return { team, app, deployment }
    } catch (_error) {
      throw notFound({ routeId: "__root__" })
    }
  },
  pendingComponent: PendingDeployment,
  head: (ctx) => ({
    meta: [
      {
        title: `Deployments - ${ctx.loaderData?.app.name} - ${ctx.loaderData?.team.name} - FastAPI Cloud`,
      },
    ],
  }),
})

function DeploymentBuildLogs({ deployment }: { deployment: { id: string } }) {
  const logs = useBuildLogs({
    deploymentId: deployment.id,
  })

  return <Logs logs={logs} />
}

function DeploymentLogs({
  deployment,
}: {
  deployment: { id: string; status: DeploymentStatus }
}) {
  const { data: logsData, isLoading: logsLoading } = useQuery({
    ...getLogsQueryOptions(deployment.id),
    enabled: deployment.status === "success",
  })

  if (logsLoading) {
    return <Logs logs={[{ message: "Loading logs..." }]} />
  }

  const logs = (logsData?.logs || []).map((log: any) => ({
    timestamp: log.timestamp,
    message: log.message,
  }))

  return <Logs logs={logs} />
}

function DeploymentDetail() {
  const { teamSlug, appSlug, deploymentId } = Route.useParams()

  const { data: team } = useSuspenseQuery(getTeamQueryOptions(teamSlug))
  const { data: app } = useSuspenseQuery(getAppQueryOptions(team.id, appSlug))
  const { data: deployment } = useSuspenseQuery(
    getDeploymentQueryOptions(app.id, deploymentId),
  )

  return (
    <Section
      title="Deployment Details"
      description={
        <div>
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
      }
    >
      <Tabs defaultValue="build-logs" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="build-logs">Build Logs</TabsTrigger>
          <TabsTrigger value="logs" disabled={deployment.status !== "success"}>
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="build-logs">
          <DeploymentBuildLogs deployment={deployment} />
        </TabsContent>
        <TabsContent value="logs">
          <DeploymentLogs deployment={deployment} />
        </TabsContent>
      </Tabs>
    </Section>
  )
}

export default DeploymentDetail
