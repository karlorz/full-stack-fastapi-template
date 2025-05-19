import { useSuspenseQuery } from "@tanstack/react-query"
import {
  Link as RouterLink,
  createFileRoute,
  notFound,
} from "@tanstack/react-router"
import { LayoutGrid, Rocket } from "lucide-react"

import QuickStart from "@/components/Common/QuickStart"
import PendingDashboard from "@/components/PendingComponents/PendingDashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCurrentUser } from "@/hooks/useAuth"
import { getDashboardDataQueryOptions } from "@/queries/apps"
import { getTeamQueryOptions } from "@/queries/teams"
import { deploymentStatusMessage } from "@/utils"

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
  const { data: appsData } = useSuspenseQuery(
    getDashboardDataQueryOptions(team.id),
  )
  const { total: totalApps, lastApp, recentApps: apps } = appsData

  return (
    <div className="w-full p-0 space-y-6">
      <div data-testid="result" className="mb-10">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Hi, <CurrentUser />
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to FastAPI Cloud! Here's what's happening with your
          applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 lg:grid-cols-2 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </p>
                <h3 className="text-2xl font-bold mt-1">{totalApps || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-400/10 flex items-center justify-center">
                <LayoutGrid className="h-6 w-6 text-foreground" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {totalApps > 0 && (
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-emerald-950/50 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-800"
                >
                  <span className="mr-1">+{apps?.length || 0}</span>
                  last 30 days
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {lastApp?.name || "Last Deployed App"}
                </p>
                <p className="font-bold mt-1">
                  {deploymentStatusMessage(
                    lastApp?.latest_deployment?.status ?? null,
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-400/10 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-foreground" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <RouterLink to={`/$teamSlug/apps/${lastApp?.slug}`}>
                {lastApp && (
                  <Button variant="outline" className="mt-4">
                    View App
                  </Button>
                )}
              </RouterLink>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {totalApps === 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <Button variant="outline" className="h-auto py-4 justify-start">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1">
                <Rocket className="h-5 w-5 text-foreground" />
                <span className="font-medium">Quickstart</span>
              </div>
              <div className="flex justify-between gap-4 w-full">
                <span className="text-sm text-muted-foreground py-2">
                  Deploy your first app
                </span>
                <QuickStart />
              </div>
            </div>
          </Button>
        </div>
      )}
    </div>
  )
}
