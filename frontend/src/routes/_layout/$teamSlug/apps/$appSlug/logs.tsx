import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Terminal } from "lucide-react"
import Deployments from "@/components/AppSettings/Deployments"
import Logs from "@/components/Deployment/Logs"
import PendingLogs from "@/components/PendingComponents/PendingLogs"
import { CustomCard } from "@/components/ui/custom-card"
import { Separator } from "@/components/ui/separator"
import { getAppLogsQueryOptions, getAppQueryOptions } from "@/queries/apps"
import { getDeploymentsQueryOptions } from "@/queries/deployments"
import { getTeamQueryOptions } from "@/queries/teams"

export const Route = createFileRoute("/_layout/$teamSlug/apps/$appSlug/logs")({
  component: LogsComponent,
  pendingComponent: PendingLogs,
  loader: async ({ context, params: { teamSlug, appSlug } }) => {
    const team = await context.queryClient.ensureQueryData(
      getTeamQueryOptions(teamSlug),
    )
    const app = await context.queryClient.ensureQueryData(
      getAppQueryOptions(team.id, appSlug),
    )
    return { team, app }
  },
  head: (ctx) => ({
    meta: [
      {
        title: `Logs - ${ctx.loaderData?.app.name} - ${ctx.loaderData?.team.name || "Team"} - FastAPI Cloud`,
      },
    ],
  }),
})

function LogsComponent() {
  const { teamSlug, appSlug } = Route.useParams()

  const { data: team } = useSuspenseQuery(getTeamQueryOptions(teamSlug))
  const { data: app } = useSuspenseQuery(getAppQueryOptions(team.id, appSlug))
  const { data: deployments } = useSuspenseQuery(
    getDeploymentsQueryOptions(app.id),
  )
  const { data: logsData } = useSuspenseQuery(getAppLogsQueryOptions(app.id))

  return (
    <CustomCard
      title="Logs"
      description="Application logs and monitoring data."
    >
      <div className="space-y-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-5 w-5" />
            <h3 className="font-medium">Real-time Logs</h3>
          </div>
          <Logs logs={logsData?.logs || []} />
        </div>
        <Separator />
        <Deployments
          deployments={deployments.data}
          teamSlug={teamSlug}
          appSlug={appSlug}
        />
      </div>
    </CustomCard>
  )
}
