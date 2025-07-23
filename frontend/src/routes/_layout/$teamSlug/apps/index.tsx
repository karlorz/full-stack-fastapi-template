import { useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  notFound,
  Link as RouterLink,
} from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { Link, Rocket } from "lucide-react"

import QuickStart from "@/components/Common/QuickStart"
import { Status } from "@/components/Deployment/Status"
import PendingApps from "@/components/PendingComponents/PendingApps"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { CustomCard } from "@/components/ui/custom-card"
import { Section } from "@/components/ui/section"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
    } catch (_error) {
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
      <Section
        title="Apps"
        description="View and manage all your applications."
      >
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
            <CustomCard
              header={
                <>
                  <Rocket className="h-8 w-8 text-foreground mb-2" />
                  <CardTitle className="text-base">QuickStart</CardTitle>
                  <CardDescription>
                    Learn how to create and deploy your first app
                  </CardDescription>
                </>
              }
            >
              <p className="pb-4">
                Follow our step-by-step guide to get your first application up
                and running in minutes.
              </p>
              <QuickStart />
            </CustomCard>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section
      title="Apps"
      description="View and manage all your applications."
      action={
        <RouterLink to="/$teamSlug/new-app">
          <Button>Create App</Button>
        </RouterLink>
      }
    >
      <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        {appsData.data.map((app) => (
          <RouterLink to={app.slug} key={app.id} className="block">
            <CustomCard
              header={
                <>
                  <div className="flex justify-between">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CardTitle className="truncate max-w-[200px] cursor-default">
                            {app.name}
                          </CardTitle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{app.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Status status={app.latest_deployment?.status ?? null} />
                  </div>
                  {app.latest_deployment ? (
                    <Badge
                      variant="outline"
                      className="flex my-2 w-full max-w-full text-xs items-center"
                    >
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 w-full min-w-0 text-xs font-mono text-primary hover:underline"
                        style={{ minWidth: 0 }}
                      >
                        <Link className="h-3 w-3 shrink-0" />
                        <span className="truncate w-full">{app.url}</span>
                      </a>
                    </Badge>
                  ) : (
                    <span className="text-sm my-2 text-muted-foreground">
                      URL will be available after deployment
                    </span>
                  )}
                </>
              }
            >
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Last Updated
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs font-medium">
                          {formatDistanceToNow(new Date(app.updated_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {new Date(app.updated_at).toLocaleString()}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground truncate">
                    Region
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal truncate"
                  >
                    {app.latest_deployment ? REGION : "—"}
                  </Badge>
                </div>
              </div>
            </CustomCard>
          </RouterLink>
        ))}
      </div>
    </Section>
  )
}

export default Apps
