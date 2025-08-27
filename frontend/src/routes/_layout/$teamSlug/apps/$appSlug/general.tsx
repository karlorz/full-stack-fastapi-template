import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Globe, Link } from "lucide-react"
import DeleteConfirmation from "@/components/AppSettings/DeleteConfirmation"
import { RecentDeployments } from "@/components/AppSettings/Deployments"
import DangerZoneAlert from "@/components/Common/DangerZone"
import { Status } from "@/components/Deployment/Status"
import PendingGeneral from "@/components/PendingComponents/PendingGeneral"
import { CustomCard } from "@/components/ui/custom-card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { getAppQueryOptions } from "@/queries/apps"
import { getDeploymentsQueryOptions } from "@/queries/deployments"
import { getTeamQueryOptions } from "@/queries/teams"

export const Route = createFileRoute(
  "/_layout/$teamSlug/apps/$appSlug/general",
)({
  component: General,
  pendingComponent: PendingGeneral,
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
        title: `General - ${ctx.loaderData?.app.name} - ${ctx.loaderData?.team.name || "Team"} - FastAPI Cloud`,
      },
    ],
  }),
})

function General() {
  const { teamSlug, appSlug } = Route.useParams()

  const { data: team } = useSuspenseQuery(getTeamQueryOptions(teamSlug))
  const { data: app } = useSuspenseQuery(getAppQueryOptions(team.id, appSlug))
  const { data: deployments } = useSuspenseQuery(
    getDeploymentsQueryOptions(app.id),
  )

  return (
    <CustomCard title="General" description="Overview of your application.">
      <div className="space-y-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4" />
            <h3 className="text-md font-medium">App Information</h3>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 p-4 rounded-lg border">
              <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
                App Name
              </Label>
              <div className="text-muted-foreground flex items-center">
                <span className="truncate pr-2">{app.name}</span>
              </div>
            </div>
            <div className="space-y-2 p-4 rounded-lg border group">
              <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
                App URL
              </Label>
              {app.latest_deployment ? (
                <div className="flex items-center gap-2">
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 min-w-0 text-xs font-mono text-primary hover:underline"
                  >
                    <Link className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{app.url}</span>
                  </a>
                </div>
              ) : (
                <span className="text-sm my-2 text-muted-foreground">
                  URL will be available after deployment
                </span>
              )}
            </div>
            <div className="space-y-2 p-4 rounded-lg border">
              <Label className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300 mb-6">
                Deployment Status
              </Label>
              <Status status={app.latest_deployment?.status ?? null} />
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <RecentDeployments deployments={deployments.data} />
        </div>

        <Separator />

        <DangerZoneAlert description="Permanently delete your data and everything associated with your app.">
          <DeleteConfirmation appId={app.id} appSlug={appSlug} />
        </DangerZoneAlert>
      </div>
    </CustomCard>
  )
}
