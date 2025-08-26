import { useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  notFound,
  Link as RouterLink,
} from "@tanstack/react-router"
import { LayoutGrid, Rocket } from "lucide-react"

import PendingDashboard from "@/components/PendingComponents/PendingDashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CustomCard } from "@/components/ui/custom-card"
import { Section } from "@/components/ui/section"
import { useCurrentUser } from "@/hooks/useAuth"
import { getDashboardDataQueryOptions } from "@/queries/apps"
import { getTeamQueryOptions } from "@/queries/teams"
import { deploymentStatusMessage } from "@/utils"

export const Route = createFileRoute("/_layout/$teamSlug/")({
  component: Dashboard,
  loader: async ({ context, params: { teamSlug } }) => {
    try {
      const team = await context.queryClient.ensureQueryData(
        getTeamQueryOptions(teamSlug),
      )
      return { team }
    } catch {
      throw notFound({ routeId: "__root__" })
    }
  },
  pendingComponent: PendingDashboard,
  head: (ctx) => ({
    meta: [
      {
        title: `Dashboard - ${ctx.loaderData?.team.name} - FastAPI Cloud`,
      },
    ],
  }),
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
    <Section
      title={
        <span data-testid="dashboard-greeting">
          Hi, <CurrentUser />
        </span>
      }
      description="Welcome to FastAPI Cloud! Here's what's happening with your applications."
    >
      {/* Stats */}
      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        <CustomCard
          title="Total Applications"
          description="Number of apps in your team"
        >
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <p className="font-bold mt-1 text-2xl">{totalApps || 0}</p>
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
            {totalApps > 0 ? (
              <RouterLink to="/$teamSlug/apps" params={{ teamSlug }}>
                <div className="h-12 w-12 rounded-full bg-gray-400/10 hover:bg-gray-400/20 transition-colors flex items-center justify-center cursor-pointer">
                  <LayoutGrid className="h-6 w-6" />
                </div>
              </RouterLink>
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-400/10 flex items-center justify-center">
                <LayoutGrid className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="mt-4">
            {totalApps > 0 && (
              <RouterLink to="/$teamSlug/apps" params={{ teamSlug }}>
                <Button variant="outline" size="sm">
                  View Apps
                </Button>
              </RouterLink>
            )}
          </div>
        </CustomCard>

        <CustomCard
          title="Last Deployed App"
          description={lastApp?.name || "No recent deployments"}
        >
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="font-bold mt-1">
                {deploymentStatusMessage(
                  lastApp?.latest_deployment?.status ?? null,
                )}
              </p>
            </div>
            {lastApp ? (
              <RouterLink
                to="/$teamSlug/apps/$appSlug"
                params={{ teamSlug, appSlug: lastApp.slug }}
              >
                <div className="h-12 w-12 rounded-full bg-gray-400/10 hover:bg-gray-400/20 transition-colors flex items-center justify-center cursor-pointer">
                  <Rocket className="h-6 w-6" />
                </div>
              </RouterLink>
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-400/10 flex items-center justify-center">
                <Rocket className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center text-sm">
            {lastApp && (
              <RouterLink
                to="/$teamSlug/apps/$appSlug"
                params={{ teamSlug, appSlug: lastApp.slug }}
              >
                <Button variant="outline" size="sm">
                  View App
                </Button>
              </RouterLink>
            )}
          </div>
        </CustomCard>
      </div>
    </Section>
  )
}
