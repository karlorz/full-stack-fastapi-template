import { useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  createLink,
  notFound,
  Outlet,
} from "@tanstack/react-router"
import PendingAppLayout from "@/components/PendingComponents/PendingAppLayout"
import { Section } from "@/components/ui/section"
import { cn } from "@/lib/utils"
import { getAppQueryOptions } from "@/queries/apps"
import { getTeamQueryOptions } from "@/queries/teams"

export const Route = createFileRoute("/_layout/$teamSlug/apps/$appSlug")({
  component: AppLayout,
  pendingComponent: PendingAppLayout,
  loader: async ({ context, params: { teamSlug, appSlug } }) => {
    try {
      const team = await context.queryClient.ensureQueryData(
        getTeamQueryOptions(teamSlug),
      )
      await context.queryClient.ensureQueryData(
        getAppQueryOptions(team.id, appSlug),
      )
    } catch (_error) {
      throw notFound({ routeId: "__root__" })
    }
  },
})

const AppLink = createLink(
  ({ className, ...props }: { className?: string }) => {
    return (
      <a
        {...props}
        className={cn(
          className,
          "whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors",
          "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
          "[&.active]:border-primary [&.active]:text-foreground",
        )}
      />
    )
  },
)

function AppLayout() {
  const { teamSlug, appSlug } = Route.useParams()

  const { data: team } = useSuspenseQuery(getTeamQueryOptions(teamSlug))
  const { data: app } = useSuspenseQuery(getAppQueryOptions(team.id, appSlug))

  return (
    <Section title={app.name}>
      <div className="space-y-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <AppLink to="general" from={Route.fullPath}>
              General
            </AppLink>
            <AppLink to="configuration" from={Route.fullPath}>
              Configuration
            </AppLink>
            <AppLink to="logs" from={Route.fullPath}>
              Logs
            </AppLink>
          </nav>
        </div>
        <Outlet />
      </div>
    </Section>
  )
}
