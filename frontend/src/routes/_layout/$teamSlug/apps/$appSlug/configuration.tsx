import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Code2 } from "lucide-react"
import EnvironmentVariables from "@/components/AppSettings/EnvironmentVariables"
import PendingConfiguration from "@/components/PendingComponents/PendingConfiguration"
import { CustomCard } from "@/components/ui/custom-card"
import { getAppQueryOptions, getEnvVarQueryOptions } from "@/queries/apps"
import { getTeamQueryOptions } from "@/queries/teams"

export const Route = createFileRoute(
  "/_layout/$teamSlug/apps/$appSlug/configuration",
)({
  component: Configuration,
  pendingComponent: PendingConfiguration,
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
        title: `Configuration - ${ctx.loaderData?.app.name} - ${ctx.loaderData?.team.name ?? "Team"} - FastAPI Cloud`,
      },
    ],
  }),
})

function Configuration() {
  const { teamSlug, appSlug } = Route.useParams()

  const { data: team } = useSuspenseQuery(getTeamQueryOptions(teamSlug))
  const { data: app } = useSuspenseQuery(getAppQueryOptions(team.id, appSlug))
  const { data: environmentVariables } = useSuspenseQuery(
    getEnvVarQueryOptions(app.id),
  )

  return (
    <CustomCard
      title="Configuration"
      description="Application configuration and resource settings."
    >
      <div className="space-y-12">
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
  )
}
