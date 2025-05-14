import { useSuspenseQuery } from "@tanstack/react-query"
import {
  Link as RouterLink,
  createFileRoute,
  notFound,
} from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { Link, Rocket } from "lucide-react"

import QuickStart from "@/components/Common/QuickStart"
import { Status } from "@/components/Deployment/Status"
import PendingApps from "@/components/PendingComponents/PendingApps"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tooltip } from "@/components/ui/tooltip"
import { getAppsQueryOptions } from "@/queries/apps"
import { getTeamQueryOptions } from "@/queries/teams"

const REGION = "us-east-1"

export const Route = createFileRoute("/_layout/$teamSlug/apps/")({
  component: Apps,
  loader: async ({ context, params: { teamSlug } }) => {
    try {
      const team = await context.queryClient.ensureQueryData(
        getTeamQueryOptions(teamSlug),
      )
      const apps = await context.queryClient.ensureQueryData(
        getAppsQueryOptions(team.id),
      )
      return { showEmptyState: apps.data.length === 0 }
    } catch (error) {
      throw notFound({ routeId: "/" })
    }
  },
  pendingComponent: PendingApps,
})

function Apps() {
  const { teamSlug } = Route.useParams()

  const { data: team } = useSuspenseQuery(getTeamQueryOptions(teamSlug))
  const { data: appsData } = useSuspenseQuery(getAppsQueryOptions(team.id))

  if (appsData?.data.length === 0) {
    return (
      <div className="container p-0">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight">Apps</h1>
          <p className="text-muted-foreground mt-1 mb-10">
            View and manage all your applications.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 px-4 ">
          <div className="w-full max-w-md text-center mb-8">
            <h2 className="text-lg font-bold mb-2">No applications yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Get started by creating your first application. Applications are
              where you'll deploy and manage your projects.
            </p>
            <RouterLink to="/$teamSlug/new-app">
              <Button>Create Your First App</Button>
            </RouterLink>
          </div>

          <div className="max-w-xs mt-10">
            <Card>
              <CardHeader className="pb-3">
                <Rocket className="h-8 w-8 text-black mb-2" />
                <CardTitle className="text-base">QuickStart</CardTitle>
                <CardDescription>
                  Learn how to create and deploy your first app
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Follow our step-by-step guide to get your first application up
                and running in minutes.
              </CardContent>
              <CardFooter>
                <QuickStart />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Apps</h1>
          <p className="text-muted-foreground mt-1 mb-10">
            View and manage all your applications.
          </p>
        </div>
        <RouterLink to="/$teamSlug/new-app">
          <Button>Create App</Button>
        </RouterLink>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {appsData.data.map((app) => (
          <RouterLink to={app.slug} key={app.id} className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="truncate max-w-3xs">
                    {app.name}
                  </CardTitle>
                  <Status status={app.latest_deployment?.status ?? null} />
                </div>
                {app.latest_deployment ? (
                  <Badge
                    variant="outline"
                    className="flex my-2 truncate text-xs"
                  >
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-xs font-mono text-primary hover:underline"
                    >
                      <Link className="h-3 w-3" />
                      <span className="text-xs truncate max-w-[250px]">
                        {app.url}
                      </span>
                    </a>
                  </Badge>
                ) : (
                  <span className="text-sm my-2 text-muted-foreground">
                    URL will be available after deployment
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Last Updated
                    </div>
                    <Tooltip>
                      <div className="text-xs font-medium">
                        {formatDistanceToNow(new Date(app.updated_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </Tooltip>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">Region</div>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {app.latest_deployment ? REGION : "—"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RouterLink>
        ))}
      </div>
    </div>
  )
}

export default Apps
