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
  deploymentStatusMessage,
  fetchLastApp,
  fetchLastAppsInLast30Days,
  fetchTeamBySlug,
  getLastDeploymentStatus,
} from "@/utils"

export const Route = createFileRoute("/_layout/$teamSlug/")({
  component: Dashboard,
  loader: async ({ params: { teamSlug } }) => {
    try {
      const teamData = await fetchTeamBySlug(teamSlug)

      const apps = await fetchLastAppsInLast30Days(teamData.id)
      const lastApp = await fetchLastApp(teamData.id)
      const lastDeploymentStatus = lastApp?.id
        ? await getLastDeploymentStatus(lastApp.id)
        : null

      return { apps, lastApp, lastDeploymentStatus }
    } catch (error) {
      if (localStorage.getItem("current_team") === teamSlug) {
        localStorage.removeItem("current_team")
      }

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
  const { apps, lastApp, lastDeploymentStatus } = Route.useLoaderData()

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
            <RouterLink to={`/$teamSlug/apps/${lastApp?.slug}/`}>
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
