import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { ExternalLink } from "lucide-react"

import DeleteApp from "@/components/AppSettings/DeleteApp"
import Deployments from "@/components/AppSettings/Deployments"
import EnvironmentVariables from "@/components/AppSettings/EnvironmentVariables"
import PendingApp from "@/components/PendingComponents/PendingApp"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAppQueryOptions, getEnvVarQueryOptions } from "@/queries/apps"
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
