import { Box, Container, Heading, Link, Text } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { ExternalLink } from "lucide-react"

import { AppsService, DeploymentsService } from "@/client"
import DeleteApp from "@/components/AppSettings/DeleteApp"
import Deployments from "@/components/AppSettings/Deployments"
import EnvironmentVariables from "@/components/AppSettings/EnvironmentVariables"
import CustomCard from "@/components/Common/CustomCard"
import PendingApp from "@/components/PendingComponents/PendingApp"
import { fetchTeamBySlug } from "@/utils"

export const Route = createFileRoute("/_layout/$team/apps/$appSlug/")({
  component: AppDetail,
  loader: async ({ context, params }) => {
    try {
      const team = await fetchTeamBySlug(params.team)

      if (!team) {
        throw notFound({ routeId: "/" })
      }

      const apps = await AppsService.readApps({
        teamId: team.id,
        slug: params.appSlug,
      })

      if (apps.data.length === 0) {
        throw notFound({ routeId: "/" })
      }

      const deployments = await DeploymentsService.readDeployments({
        appId: apps.data[0].id,
        orderBy: "created_at",
        limit: 5,
      })

      const app = apps.data[0]

      await context.queryClient.ensureQueryData({
        queryKey: ["apps", app.id, "environmentVariables"],
        queryFn: () => AppsService.readEnvironmentVariables({ appId: app.id }),
      })

      return { app, deployments }
    } catch (error) {
      throw notFound({ routeId: "/" })
    }
  },
  pendingComponent: PendingApp,
})

function AppDetail() {
  const { app, deployments: initialDeployments } = Route.useLoaderData()

  const { data: deployments } = useQuery({
    queryKey: ["deployments", app.id],
    queryFn: () =>
      DeploymentsService.readDeployments({
        appId: app.id,
        orderBy: "created_at",
        limit: 5,
      }),
    initialData: initialDeployments,
    refetchInterval: 10000,
  })

  const { data: environmentVariables } = useQuery({
    queryKey: ["apps", app.id, "environmentVariables"],
    queryFn: () => AppsService.readEnvironmentVariables({ appId: app.id }),
  })

  return (
    <Container maxW="full" p={0}>
      <Heading size="xl" pb={2}>
        {app?.name}
      </Heading>
      <Box pb={10}>
        {app.url && (
          <Link
            href={app.url}
            color="main.dark"
            fontWeight="bold"
            target="_blank"
            rel="noopener noreferrer"
          >
            {app.url}
            <ExternalLink size={16} />
          </Link>
        )}
        <Text>Last Updated: {new Date(app?.updated_at).toLocaleString()}</Text>
        <Box pt={10}>
          <CustomCard title="Deployments">
            <Deployments deployments={deployments.data} />
          </CustomCard>

          <CustomCard title="Environment Variables">
            <EnvironmentVariables
              environmentVariables={environmentVariables?.data || []}
              appId={app.id}
            />
          </CustomCard>

          <CustomCard>
            <DeleteApp appSlug={app.slug} appId={app.id} />
          </CustomCard>
        </Box>
      </Box>
    </Container>
  )
}
