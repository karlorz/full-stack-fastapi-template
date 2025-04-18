import {
  Link as RouterLink,
  createFileRoute,
  notFound,
} from "@tanstack/react-router"

import QuickStart from "@/components/Common/QuickStart"
import PendingDashboard from "@/components/PendingComponents/PendingDashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentUser } from "@/hooks/useAuth"
import {
  getLastAppQueryOptions,
  getRecentAppsQueryOptions,
} from "@/queries/apps"
import { getTeamQueryOptions } from "@/queries/teams"
import { deploymentStatusMessage, getLastDeploymentStatus } from "@/utils"
import { useSuspenseQuery } from "@tanstack/react-query"

export const Route = createFileRoute("/_layout/$teamSlug/")({
  component: Dashboard,
  loader: async ({ context, params: { teamSlug } }) => {
    try {
      await context.queryClient.ensureQueryData(getTeamQueryOptions(teamSlug))
    } catch {
      throw notFound({ routeId: "/" })
    }
  },
  pendingComponent: PendingDashboard,
})

const CurrentUser = () => {
  const currentUser = useCurrentUser()

  return currentUser?.full_name || currentUser?.email
}

function Dashboard() {
  const { teamSlug } = Route.useParams()
  const { data: team } = useSuspenseQuery(getTeamQueryOptions(teamSlug))
  const { data: apps } = useSuspenseQuery(getRecentAppsQueryOptions(team.id))
  const { data: lastApp } = useSuspenseQuery(getLastAppQueryOptions(team.id))
  const { data: lastDeploymentStatus } = useSuspenseQuery({
    queryKey: ["deployments", lastApp?.id, "last"],
    queryFn: () => (lastApp?.id ? getLastDeploymentStatus(lastApp.id) : null),
  })

  return (
    <div className="w-full p-0 space-y-6">
      <Card data-testid="result">
        <CardContent className="pt-6">
          <div className="text-2xl truncate max-w-full">
            Hi, <CurrentUser />
          </div>
          <p className="text-muted-foreground">
            Welcome back, nice to see you again!
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickStart />
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full md:w-[55%]">
          <CardHeader>
            <CardTitle>{lastApp?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {deploymentStatusMessage(lastDeploymentStatus)}
            </p>
            <RouterLink to={`/$teamSlug/apps/${lastApp?.slug}`}>
              {lastApp && (
                <Button variant="outline" className="mt-4">
                  View App
                </Button>
              )}
            </RouterLink>
          </CardContent>
        </Card>

        <Card className="w-full md:w-[45%]">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 flex flex-col md:flex-row">
              <div>
                <p className="text-sm text-muted-foreground">Apps</p>
                <p className="text-2xl font-bold">{apps.length}</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
