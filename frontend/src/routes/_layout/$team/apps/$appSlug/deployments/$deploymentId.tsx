import { AppsService, DeploymentsService } from "@/client"
import CustomCard from "@/components/Common/CustomCard"
import Logs from "@/components/Deployment/Logs"
import { Status } from "@/components/Deployment/Status"
import PendingDeployment from "@/components/PendingComponents/PendingDeployment"
import { fetchTeamBySlug } from "@/utils"
import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_layout/$team/apps/$appSlug/deployments/$deploymentId",
)({
  component: DeploymentDetail,
  loader: async ({ params }) => {
    try {
      const team = await fetchTeamBySlug(params.team)
      const apps = await AppsService.readApps({
        teamId: team.id,
        slug: params.appSlug,
      })
      const app = apps.data[0]

      const deployment = await DeploymentsService.readDeployment({
        appId: app.id,
        deploymentId: params.deploymentId,
      })

      const { logs } = await DeploymentsService.readDeploymentLogs({
        deploymentId: deployment.id,
      })

      return { deployment, logs }
    } catch (error) {
      throw notFound({ routeId: "/" })
    }
  },
  pendingComponent: PendingDeployment,
})

function DeploymentDetail() {
  const { deployment: initialDeployment, logs: initialLogs } =
    Route.useLoaderData()

  const { data: deployment } = useQuery({
    queryKey: ["deployments", initialDeployment.id],
    queryFn: () =>
      DeploymentsService.readDeployment({
        appId: initialDeployment.app_id,
        deploymentId: initialDeployment.id,
      }),
    initialData: initialDeployment,
    refetchInterval: 5000,
  })

  const { data } = useQuery({
    queryKey: ["deployment-logs", initialDeployment.id],
    queryFn: () =>
      DeploymentsService.readDeploymentLogs({
        deploymentId: initialDeployment.id,
      }),
    initialData: { logs: initialLogs },
    refetchInterval: 5000,
  })

  return (
    <Container maxW="full" p={0}>
      <Flex alignItems="center">
        <Heading size="xl" pb={2}>
          Deployment Details
        </Heading>
      </Flex>

      <Box mb={10}>
        <Text>
          Last updated: {new Date(deployment?.updated_at).toLocaleString()}
        </Text>
        <Flex alignItems="center" gap={2}>
          <Text>Status:</Text>
          <Status deployment={deployment} />
        </Flex>
      </Box>

      <CustomCard title="Logs">
        <Logs logs={data.logs} />
      </CustomCard>
    </Container>
  )
}

export default DeploymentDetail
