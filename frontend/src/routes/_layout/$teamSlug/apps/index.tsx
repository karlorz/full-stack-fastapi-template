import { useSuspenseQuery } from "@tanstack/react-query"
import {
  Link as RouterLink,
  createFileRoute,
  notFound,
} from "@tanstack/react-router"
import { PackageOpen } from "lucide-react"

import { ALL_APPS_COLUMNS } from "@/components/Apps/columns"
import { DataTable } from "@/components/Common/DataTable"
import EmptyState from "@/components/Common/EmptyState"
import PendingApps from "@/components/PendingComponents/PendingApps"
import { Button } from "@/components/ui/button"
import { getAppsQueryOptions } from "@/queries/apps"
import { getTeamQueryOptions } from "@/queries/teams"

export const Route = createFileRoute("/_layout/$teamSlug/apps/")({
  component: Apps,
  loader: async ({ context, params: { teamSlug } }) => {
    try {
      await context.queryClient.ensureQueryData(getTeamQueryOptions(teamSlug))
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
        <div className="flex justify-between">
          <div className="mb-10">
            <h1 className="text-2xl font-extrabold tracking-tight">Apps</h1>
            <p className="text-sm text-muted-foreground">
              View and manage apps related to your team.
            </p>
          </div>

          <div className="my-4">
            <RouterLink to="/$teamSlug/new-app">
              <Button>Create App</Button>
            </RouterLink>
          </div>
        </div>

        <EmptyState
          title="You don't have any app yet"
          description="Create your first app to get started and deploy it to the cloud."
          icon={PackageOpen}
        />
      </div>
    )
  }

  return (
    <div className="container p-0">
      <div className="flex justify-between">
        <div className="mb-10">
          <h1 className="text-2xl font-extrabold tracking-tight">Apps</h1>
          <p className="text-sm text-muted-foreground">
            View and manage apps related to your team.
          </p>
        </div>

        <div className="my-4">
          <RouterLink to="/$teamSlug/new-app">
            <Button>Create App</Button>
          </RouterLink>
        </div>
      </div>

      <DataTable
        dataTestId="apps-table"
        columns={ALL_APPS_COLUMNS}
        data={appsData.data}
        getRowLink={(app) => `${app.slug}`}
      />
    </div>
  )
}

export default Apps
