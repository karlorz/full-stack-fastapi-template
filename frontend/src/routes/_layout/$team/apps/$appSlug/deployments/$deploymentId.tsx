import { AppsService, DeploymentsService } from "@/client"
import CustomCard from "@/components/Common/CustomCard"
import Logs from "@/components/Deployment/Logs"
import { Status } from "@/components/Deployment/Status"
import PendingDeployment from "@/components/PendingComponents/PendingDeployment"
import { fetchTeamBySlug } from "@/utils"
import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react"
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
      throw notFound()
    }
  },
  pendingComponent: PendingDeployment,
})

function DeploymentDetail() {
  const { deployment, logs } = Route.useLoaderData()

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
        <Logs logs={logs} />
      </CustomCard>
    </Container>
  )
}

export default DeploymentDetail
